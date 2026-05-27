// Dummy data following the specified schema structure
export const dummyUsers = {
  renters: [
    {
      id: "renter-1",
      full_name: "Sarah Johnson",
      email: "sarah@example.com",
      profile_picture: "/woman-profile.png",
      rating: 4.8,
      age: 28,
    },
    {
      id: "renter-2",
      full_name: "Michael Chen",
      email: "michael@example.com",
      profile_picture: "/man-profile.png",
      rating: 4.6,
      age: 35,
    },
  ],
  owners: [
    {
      id: "owner-1",
      full_name: "Alex Rodriguez",
      email: "alex@example.com",
      profile_picture: "/profile-picture-professional-man.jpg",
      isVerified: true,
      rating: 4.9,
      age: 42,
      nic: "NIC-123456789",
    },
    {
      id: "owner-2",
      full_name: "Emma Wilson",
      email: "emma@example.com",
      profile_picture: "/profile-picture-professional-woman.jpg",
      isVerified: false,
      rating: 4.7,
      age: 38,
      nic: "NIC-987654321",
    },
  ],
  admin: {
    id: "admin-1",
    full_name: "Admin User",
    email: "admin@example.com",
    profile_picture: "/profile-picture-admin.jpg",
  },
}

export const dummyLocations = [
  {
    id: "loc-1",
    name: "Downtown Center",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "loc-2",
    name: "Airport Terminal",
    latitude: 40.7769,
    longitude: -73.874,
  },
  {
    id: "loc-3",
    name: "Waterfront District",
    latitude: 40.7061,
    longitude: -74.0087,
  },
]

export const dummyVehicles = [
  {
    id: "vehicle-1",
    make: "Toyota",
    model: "Camry",
    year: 2023,
    type: "Sedan",
    capacity: 5,
    daily_price: 49.99,
    license_plate: "ABC-1234",
    image_url: "/toyota-camry-sedan.png",
    location: dummyLocations[0],
    owner: dummyUsers.owners[0],
    availability: true,
    rating: 4.8,
  },
  {
    id: "vehicle-2",
    make: "Honda",
    model: "CR-V",
    year: 2023,
    type: "SUV",
    capacity: 7,
    daily_price: 69.99,
    license_plate: "XYZ-5678",
    image_url: "/honda-crv-suv.png",
    location: dummyLocations[1],
    owner: dummyUsers.owners[1],
    availability: true,
    rating: 4.7,
  },
  {
    id: "vehicle-3",
    make: "BMW",
    model: "3 Series",
    year: 2022,
    type: "Sedan",
    capacity: 5,
    daily_price: 99.99,
    license_plate: "DEF-9012",
    image_url: "/bmw-3-series-luxury-car.jpg",
    location: dummyLocations[2],
    owner: dummyUsers.owners[0],
    availability: true,
    rating: 4.9,
  },
  {
    id: "vehicle-4",
    make: "Ford",
    model: "Explorer",
    year: 2023,
    type: "SUV",
    capacity: 8,
    daily_price: 79.99,
    license_plate: "GHI-3456",
    image_url: "/ford-explorer-suv.png",
    location: dummyLocations[0],
    owner: dummyUsers.owners[1],
    availability: false,
    rating: 4.6,
  },
]

export const dummyBookings = [
  {
    id: "booking-1",
    vehicle: dummyVehicles[0],
    renter: dummyUsers.renters[0],
    pickup_date: "2025-01-10",
    pickup_time: "10:00",
    return_date: "2025-01-15",
    return_time: "10:00",
    pickup_location: dummyLocations[0],
    status: "pending",
    total_price: 249.95,
  },
]

export const dummyChats = [
  {
    id: "chat-1",
    participant_one: dummyUsers.renters[0],
    participant_two: dummyUsers.owners[0],
    vehicle: dummyVehicles[0],
    last_message: "Can you hold this vehicle for me?",
    last_message_time: new Date("2025-01-09T14:30:00"),
    messages: [
      {
        id: "msg-1",
        sender_id: "renter-1",
        content: "Hi, is this car still available?",
        timestamp: new Date("2025-01-09T14:00:00"),
      },
      {
        id: "msg-2",
        sender_id: "owner-1",
        content: "Yes, available from tomorrow!",
        timestamp: new Date("2025-01-09T14:15:00"),
      },
      {
        id: "msg-3",
        sender_id: "renter-1",
        content: "Can you hold this vehicle for me?",
        timestamp: new Date("2025-01-09T14:30:00"),
      },
    ],
  },
]

export const dummyVerificationRequests = [
  {
    id: "verify-1",
    owner: dummyUsers.owners[1],
    driver_license_image: "/generic-identification-document.png",
    nic_image: "/national-id-card-document.jpg",
    status: "pending",
    submitted_at: new Date("2025-01-08"),
  },
]
