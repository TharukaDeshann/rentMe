import re

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'r') as f:
    content = f.read()

# Add useToast import if not present
if "import { useToast } from" not in content:
    content = content.replace('import { useState } from "react"', 'import { useState } from "react"\nimport { useToast } from "@/hooks/use-toast"')

# Add toast hook
if "const { toast } = useToast()" not in content:
    content = content.replace('const [profileData, setProfileData] = useState<any>(null)', 'const [profileData, setProfileData] = useState<any>(null)\n  const { toast } = useToast()')

# Update handleLoginSuccess to show toast on error and success
login_pattern = r'''  const handleLoginSuccess = async \(email: string, password: string\) => \{
    try \{
      const data = await authService\.login\(\{ email, password \}\);
      
      setCurrentUser\(\{ id: data\.userId\.toString\(\), name: data\.email, email: data\.email, image: "/woman-profile\.png" \}\)
      setCurrentRole\(\(data\.role as UserRole\) \|\| "renter"\)
      setIsAuthenticated\(true\)
      setAuthView\("app"\)
    \} catch \(err\) \{
      throw err
    \}
  \}'''

login_replacement = '''  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      
      setCurrentUser({ id: data.userId.toString(), name: data.email, email: data.email, image: "/woman-profile.png" })
      setCurrentRole((data.role as UserRole) || "renter")
      setIsAuthenticated(true)
      setAuthView("app")
      toast({ title: "Login Successful", description: "Welcome back!" })
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.response?.data?.message || err.message || "Invalid credentials", variant: "destructive" })
      throw err
    }
  }'''

content = re.sub(login_pattern, login_replacement, content)

# Update handleRegistrationSuccess to show toast on error and success
register_pattern = r'''  const handleRegistrationSuccess = async \(formData: \{
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth\?: string;
  \}\) => \{
    try \{
      const data = await authService\.register\(\{
        fullName: formData\.fullName,
        email: formData\.email,
        password: formData\.password,
        contactNumber: formData\.phoneNumber,
        dateOfBirth: formData\.dateOfBirth,
        role: "RENTER"
      \}\);
      
      setCurrentUser\(\{ id: data\.userId\.toString\(\), name: formData\.fullName, email: formData\.email, image: "/woman-profile\.png" \}\)
      setCurrentRole\(\(data\.role as UserRole\) \|\| "renter"\)
      setIsAuthenticated\(true\)
      setAuthView\("app"\)
    \} catch \(err\) \{
      throw err
    \}
  \}'''

register_replacement = '''  const handleRegistrationSuccess = async (formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    dateOfBirth?: string;
  }) => {
    try {
      const data = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        role: "RENTER"
      });
      
      setCurrentUser({ id: data.userId.toString(), name: formData.fullName, email: formData.email, image: "/woman-profile.png" })
      setCurrentRole((data.role as UserRole) || "renter")
      setIsAuthenticated(true)
      setAuthView("app")
      toast({ title: "Registration Successful", description: "Your account has been created." })
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.response?.data?.message || err.message || "Failed to create account", variant: "destructive" })
      throw err
    }
  }'''

content = re.sub(register_pattern, register_replacement, content)

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'w') as f:
    f.write(content)

