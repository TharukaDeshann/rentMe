import re

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'r') as f:
    content = f.read()

login_replacement = """  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      
      setCurrentUser({ id: data.userId.toString(), name: data.email, email: data.email, image: "/woman-profile.png" })
      setCurrentRole((data.role as UserRole) || "renter")
      setIsAuthenticated(true)
      setAuthView("app")
    } catch (err) {
      throw err
    }
  }

  const handleRegistrationSuccess = async (formData: {
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
    } catch (err) {
      throw err
    }
  }"""

# Replace handleLoginSuccess and handleRegistrationSuccess
pattern = r"  const handleLoginSuccess = async.*?throw err\n    }\n  }"
content = re.sub(pattern, login_replacement, content, flags=re.DOTALL)

with open('/home/tharuka/Desktop/rentMe Project/rentMe/rentMe_frontend/app/page.tsx', 'w') as f:
    f.write(content)
