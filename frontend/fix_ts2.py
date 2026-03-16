import sys
import re

with open('/Users/solminde/Desktop/webhook debugging visualizer/frontend/src/App.tsx', 'r') as f:
    text = f.read()

# remove exactly line 17 and line 28 or we just replace them
lines = text.split('\n')
for i, line in enumerate(lines):
    if line.strip() == 'Filter,':
        lines[i] = ''
    elif line.strip() == 'ExternalLink,':
        lines[i] = ''

with open('/Users/solminde/Desktop/webhook debugging visualizer/frontend/src/App.tsx', 'w') as f:
    f.write('\n'.join(lines))
