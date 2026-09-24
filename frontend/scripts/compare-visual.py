"""Compare screenshots produced by verify-visual.cjs (requires Pillow)."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "test-results" / "visual"
results = []
for source in sorted(folder.glob("*-reference.png")):
    target = source.with_name(source.name.replace("-reference", "-next"))
    reference = Image.open(source).convert("RGB")
    actual = Image.open(target).convert("RGB")
    result = {"screen": source.stem.replace("-reference", ""), "reference_size": reference.size, "actual_size": actual.size}
    if reference.size == actual.size:
        difference = ImageChops.difference(reference, actual)
        result["identical"] = difference.getbbox() is None
        result["mean_channel_difference"] = sum(ImageStat.Stat(difference).mean) / 3
    results.append(result)
print(json.dumps(results, indent=2))
if not results or any(r["reference_size"] != r["actual_size"] for r in results):
    raise SystemExit(1)
