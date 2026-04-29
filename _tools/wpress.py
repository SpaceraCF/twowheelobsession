#!/usr/bin/env python3
"""
wpress extractor / scanner for All-in-One WP Migration archives.

Header layout (4377 bytes, ASCII null-terminated strings):
    255  name
     14  size
     12  mtime
   4096  path
End-of-archive: a header block of all zeros.

Subcommands:
    scan <archive>                     list every file with size + path (no extraction)
    extract <archive> <out> [paths]    extract; optional path-prefix filters (any-of)
"""
import os
import sys
import struct

HEADER_SIZE = 4377
NAME_LEN, SIZE_LEN, MTIME_LEN, PATH_LEN = 255, 14, 12, 4096


def cstr(buf: bytes) -> str:
    return buf.split(b"\x00", 1)[0].decode("utf-8", errors="replace")


def read_header(f):
    h = f.read(HEADER_SIZE)
    if len(h) < HEADER_SIZE or h == b"\x00" * HEADER_SIZE:
        return None
    name = cstr(h[0:NAME_LEN])
    size = int(cstr(h[NAME_LEN:NAME_LEN + SIZE_LEN]) or "0")
    mtime = int(cstr(h[NAME_LEN + SIZE_LEN:NAME_LEN + SIZE_LEN + MTIME_LEN]) or "0")
    path = cstr(h[NAME_LEN + SIZE_LEN + MTIME_LEN:NAME_LEN + SIZE_LEN + MTIME_LEN + PATH_LEN])
    return name, size, mtime, path


def scan(archive):
    total_files = 0
    total_bytes = 0
    by_top = {}  # top-level dir -> (count, bytes)
    with open(archive, "rb") as f:
        while True:
            hdr = read_header(f)
            if hdr is None:
                break
            name, size, mtime, path = hdr
            total_files += 1
            total_bytes += size
            top = path.split("/", 1)[0] if path and path != "." else "(root)"
            c, b = by_top.get(top, (0, 0))
            by_top[top] = (c + 1, b + size)
            full = f"{path}/{name}" if path and path != "." else name
            print(f"{size:>12}  {full}")
            f.seek(size, 1)
    sys.stderr.write(f"\n=== summary ===\n")
    sys.stderr.write(f"files: {total_files}   bytes: {total_bytes:,}\n")
    for top, (c, b) in sorted(by_top.items(), key=lambda x: -x[1][1]):
        sys.stderr.write(f"  {top:<40} {c:>8} files   {b:>15,} bytes\n")


def extract(archive, outdir, prefixes=None):
    os.makedirs(outdir, exist_ok=True)
    extracted_files = 0
    extracted_bytes = 0
    skipped_files = 0
    skipped_bytes = 0
    with open(archive, "rb") as f:
        while True:
            hdr = read_header(f)
            if hdr is None:
                break
            name, size, mtime, path = hdr
            full_rel = f"{path}/{name}" if path and path != "." else name
            keep = (not prefixes) or any(full_rel.startswith(p) for p in prefixes)
            if not keep:
                f.seek(size, 1)
                skipped_files += 1
                skipped_bytes += size
                continue
            target_dir = os.path.join(outdir, path) if path and path != "." else outdir
            os.makedirs(target_dir, exist_ok=True)
            target = os.path.join(target_dir, name)
            with open(target, "wb") as out:
                remaining = size
                while remaining > 0:
                    chunk = f.read(min(1024 * 1024, remaining))
                    if not chunk:
                        break
                    out.write(chunk)
                    remaining -= len(chunk)
            try:
                os.utime(target, (mtime, mtime))
            except OSError:
                pass
            extracted_files += 1
            extracted_bytes += size
            if extracted_files % 500 == 0:
                sys.stderr.write(f"... {extracted_files} files, {extracted_bytes:,} bytes\n")
    sys.stderr.write(f"\nextracted: {extracted_files} files, {extracted_bytes:,} bytes\n")
    sys.stderr.write(f"skipped:   {skipped_files} files, {skipped_bytes:,} bytes\n")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "scan":
        scan(sys.argv[2])
    elif cmd == "extract":
        archive = sys.argv[2]
        outdir = sys.argv[3]
        prefixes = sys.argv[4:] if len(sys.argv) > 4 else None
        extract(archive, outdir, prefixes)
    else:
        print(__doc__)
        sys.exit(2)


if __name__ == "__main__":
    main()
