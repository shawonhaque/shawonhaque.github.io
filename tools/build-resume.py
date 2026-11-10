#!/usr/bin/env python3
"""Build assets/resume/Shawon-Haque-Resume.pdf from resume.html.

Two steps:

1. Chrome prints resume.html to PDF.
2. The embedded photo is switched from an ICCBased colour space to DeviceRGB.

Step 2 matters. Chrome writes the photo as `/ColorSpace [/ICCBased <stream>]`,
and a reader must have ICC support to decode that. Small or embedded PDF
libraries — the ones inside mobile viewers and chat apps — often do not, and
they drop the image, so the resume comes up with a blank photo. DeviceRGB
carries no such dependency: every reader decodes it.

The photo itself is sRGB, so dropping the profile does not change how it looks.

Usage:  python3 tools/build-resume.py
Needs:  chromium on PATH, and pikepdf (pip install pikepdf)
"""

import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RESUME_DIR = ROOT / "assets" / "resume"
SOURCE = RESUME_DIR / "resume.html"
TARGET = RESUME_DIR / "Shawon-Haque-Resume.pdf"

COMPONENT_SPACE = {1: "/DeviceGray", 3: "/DeviceRGB", 4: "/DeviceCMYK"}


def render_pdf() -> None:
    chromium = shutil.which("chromium") or shutil.which("google-chrome")
    if not chromium:
        sys.exit("chromium not found on PATH")
    subprocess.run(
        [
            chromium,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={TARGET}",
            SOURCE.as_uri(),
        ],
        check=True,
    )


def use_device_colour_space() -> int:
    try:
        import pikepdf
    except ImportError:
        sys.exit("pikepdf is required: pip install pikepdf")

    changed = 0
    with pikepdf.open(TARGET, allow_overwriting_input=True) as pdf:
        for page in pdf.pages:
            xobjects = page.get("/Resources", {}).get("/XObject")
            if not xobjects:
                continue
            for image in xobjects.values():
                if str(image.get("/Subtype")) != "/Image":
                    continue
                space = image.get("/ColorSpace")
                if space is None or str(space[0]) != "/ICCBased":
                    continue
                components = int(space[1].get("/N"))
                image["/ColorSpace"] = pikepdf.Name(COMPONENT_SPACE.get(components, "/DeviceRGB"))
                changed += 1
        pdf.save()
    return changed


def main() -> None:
    render_pdf()
    changed = use_device_colour_space()
    size = TARGET.stat().st_size
    print(f"{TARGET.relative_to(ROOT)}: {size} bytes, {changed} image(s) set to DeviceRGB")


if __name__ == "__main__":
    main()
