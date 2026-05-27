// User information utility functions
export function getCurrentUserInfo(role: "renter" | "owner" | "admin") {
  const userMap = {
    renter: { id: "renter-1", name: "Sarah Johnson", email: "sarah@example.com" },
    owner: { id: "owner-1", name: "Alex Rodriguez", email: "alex@example.com" },
    admin: { id: "admin-1", name: "Admin User", email: "admin@example.com" },
  }
  return userMap[role]
}

export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}
