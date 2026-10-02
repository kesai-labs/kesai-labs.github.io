#!/usr/bin/env python3
"""Render shared page metadata into the checked-in static HTML."""
import argparse
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(pattern, replacement, text):
    result, count = re.subn(pattern, lambda match: replacement(match), text, count=1, flags=re.S)
    if count != 1:
        raise ValueError(f'Missing expected HTML: {pattern}')
    return result


def render():
    pages = json.loads((ROOT / 'site-metadata.json').read_text())
    output = {}
    listing = (ROOT / 'blog/index.html').read_text()
    for filename, page in pages.items():
        source = (ROOT / filename).read_text()
        overrides = page.get('overrides', {})
        source = replace_once(r'<title>.*?</title>', lambda m: '<title>' + html.escape(overrides.get('title', page['title'])) + '</title>', source)
        for field in (('description', 'og:title', 'og:description', 'twitter:title', 'twitter:description') if 'description' in page else ()):
            default = page.get('title' if field.endswith(':title') else 'description')
            if default is None:
                continue
            value = html.escape(overrides.get(field, default), quote=True)
            source = replace_once(r'(<meta\s+(?:name|property)="' + re.escape(field) + r'"\s+content=")[^"]*("\s*/?>)', lambda m: m[1] + value + m[2], source)
        if filename.startswith('blog/') and filename != 'blog/index.html':
            source = replace_once(r'(<h1 class="section-title">).*?(</h1>)', lambda m: m[1] + html.escape(page['title']) + m[2], source)
            url = '/' + filename.removesuffix('index.html')
            listing = replace_once(r'(<a href="' + re.escape(url) + r'" class="pub-title">)\s*.*?\s*(</a>)', lambda m: m[1] + '\n              ' + html.escape(page['title']) + '\n            ' + m[2], listing)
            if page.get('abstract_from_opening'):
                opening = re.search(r'<div class="blog-body">\s*<p>(.*?)</p>', source, re.S)[1]
                # Listing excerpts omit article-local citations and inline markup.
                opening = re.sub(r'<sup>.*?</sup>', '', opening, flags=re.S)
                opening = html.escape(html.unescape(re.sub(r'<[^>]+>', '', opening)))
                listing = replace_once(r'(<a href="' + re.escape(url) + r'" class="pub-title">.*?<p class="pub-abstract">).*?(</p>)', lambda m: m[1] + opening + m[2], listing)
        output[filename] = source
    # Keep the listing's own metadata and its updated post cards.
    output['blog/index.html'] = output['blog/index.html'].split('<body>', 1)[0] + '<body>' + listing.split('<body>', 1)[1]
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if generated HTML needs updating')
    args = parser.parse_args()
    changed = []
    for filename, content in render().items():
        path = ROOT / filename
        if path.read_text() != content:
            changed.append(filename)
            if not args.check:
                path.write_text(content)
    if args.check and changed:
        parser.exit(1, 'Outdated metadata: ' + ', '.join(changed) + '\n')
    print('Metadata is up to date.' if not changed else 'Updated: ' + ', '.join(changed))


if __name__ == '__main__':
    main()
