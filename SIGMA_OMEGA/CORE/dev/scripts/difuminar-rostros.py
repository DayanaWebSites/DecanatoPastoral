"""
Difuminado sutil de rostros — Decanato Dulce Nombre de Jesus
Detector: MTCNN (facenet-pytorch, pesos incluidos en el paquete).
Se corre en dos escalas para atrapar rostros chicos del fondo.
El difuminado es eliptico y emplumado: el rostro deja de ser identificable
sin el clasico recuadro que rompe la foto.
"""
import cv2, numpy as np, sys, os, torch
from PIL import Image
from facenet_pytorch import MTCNN

DET = MTCNN(keep_all=True, min_face_size=14, thresholds=[0.6, 0.6, 0.65],
            post_process=False, device='cpu')


def _boxes_at(pil, scale):
    if scale != 1.0:
        pil = pil.resize((int(pil.width * scale), int(pil.height * scale)), Image.LANCZOS)
    with torch.no_grad():
        boxes, probs = DET.detect(pil)
    out = []
    if boxes is None:
        return out
    for b, p in zip(boxes, probs):
        if p is None or p < 0.90:
            continue
        x1, y1, x2, y2 = [v / scale for v in b]
        out.append((x1, y1, x2, y2, float(p)))
    return out


def detect(bgr):
    pil = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    h, w = bgr.shape[:2]
    base = 1400 / max(w, h)
    cands = _boxes_at(pil, base) + _boxes_at(pil, base * 2.0)
    # union de cajas solapadas
    out = []
    for x1, y1, x2, y2, p in sorted(cands, key=lambda z: -(z[2] - z[0]) * (z[3] - z[1])):
        hit = False
        for i, (X1, Y1, X2, Y2, P) in enumerate(out):
            ix = max(0, min(x2, X2) - max(x1, X1))
            iy = max(0, min(y2, Y2) - max(y1, Y1))
            if ix * iy > 0.25 * min((x2 - x1) * (y2 - y1), (X2 - X1) * (Y2 - Y1)):
                out[i] = (min(x1, X1), min(y1, Y1), max(x2, X2), max(y2, Y2), max(p, P))
                hit = True
                break
        if not hit:
            out.append((x1, y1, x2, y2, p))
    return out


def blur(path, dst, extra=(), pad=0.34):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    boxes = detect(img)
    # cajas manuales en coordenadas normalizadas (x1,y1,x2,y2) para lo que el detector no vio
    for (a, b, c, d) in extra:
        boxes.append((a * w, b * h, c * w, d * h, 1.0))
    if not boxes:
        cv2.imwrite(dst, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
        return 0
    small = cv2.resize(img, (max(1, w // 20), max(1, h // 20)), interpolation=cv2.INTER_LINEAR)
    pix = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
    k = max(31, (int(min(w, h) * 0.04) | 1))
    blurred = cv2.GaussianBlur(pix, (k, k), 0)

    mask = np.zeros((h, w), np.float32)
    for (x1, y1, x2, y2, _p) in boxes:
        cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
        rx, ry = int((x2 - x1) * (0.5 + pad)), int((y2 - y1) * (0.5 + pad))
        cv2.ellipse(mask, (cx, cy), (max(rx, 8), max(ry, 8)), 0, 0, 360, 1.0, -1)
    fk = max(15, (int(min(w, h) * 0.018) | 1))
    mask = cv2.GaussianBlur(mask, (fk, fk), 0)
    mask = np.clip(mask * 1.25, 0, 1)[..., None]

    res = (img * (1 - mask) + blurred * mask).astype(np.uint8)
    cv2.imwrite(dst, res, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return len(boxes)


if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            print(f, blur(os.path.join(src, f), os.path.join(out, f)), 'rostros')
