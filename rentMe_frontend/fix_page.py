import re

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'r') as f:
    content = f.read()

# 1. remove `import authService from "@/services/auth.service"` at the very beginning
content = content.replace('import authService from "@/services/auth.service"\n"use client"', '"use client"\nimport authService from "@/services/auth.service";')

# 2. fix duplicate `handleRegistrationSuccess`. Let's just find and replace the whole section of handleRegistrationSuccess carefully
def fix_registrations(text):
    # Find all occurrences of handleRegistrationSuccess
    pattern = r"  const handleRegistrationSuccess = async \(.*?throw err(\n\s*\}\n  \})"
    matches = list(re.finditer(pattern, text, re.DOTALL))
    if len(matches) > 1:
        # Keep the FIRST one, remove the others
        first_match_end = matches[0].end()
        text = text[:first_match_end] + re.sub(pattern, "", text[first_match_end:], flags=re.DOTALL)
    
    # Wait, the second one might not match exactly. Better to just look for handleLogout and remove anything between first handleRegistrationSuccess and handleLogout
    return text

content = fix_registrations(content)

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'w') as f:
    f.write(content)
