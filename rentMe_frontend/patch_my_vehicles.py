import re

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/components/owner/my-vehicles.tsx', 'r') as f:
    content = f.read()

import_statement = 'import vehicleService from "@/services/vehicle.service";\n'
content = re.sub(r'import { dummyVehicles } from "@/lib/dummy-data";', r'import { dummyVehicles } from "@/lib/dummy-data";\n' + import_statement, content)

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/components/owner/my-vehicles.tsx', 'w') as f:
    f.write(content)
