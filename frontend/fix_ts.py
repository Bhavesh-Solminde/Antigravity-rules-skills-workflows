import sys
import re

with open('/Users/solminde/Desktop/webhook debugging visualizer/frontend/src/App.tsx', 'r') as f:
    text = f.read()

# Fix React import
text = text.replace("import React, { useEffect", "import { useEffect")

# Apply WebhookEvent typing to DEMO_WEBHOOKS
text = text.replace("const DEMO_WEBHOOKS =", "const DEMO_WEBHOOKS: any[] =")

with open('/Users/solminde/Desktop/webhook debugging visualizer/frontend/src/App.tsx', 'w') as f:
    f.write(text)
