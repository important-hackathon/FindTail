Link to website - <a href="https://find-tail.vercel.app/">Link<a> or https://find-tail.vercel.app/

# FindTail - Connecting Animals with Loving Homes

FindTail is a compassionate platform that connects animal shelters with potential adopters in Ukraine. Our mission is to help animals affected by the war find safe and loving homes while providing support to shelters and volunteers.

![FindTail Logo](/public/assets/images/findtail-logo.svg)

## 🚀 Tech Stack

FindTail is built using modern web technologies:

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage


## ✨ Features

### Currently Available

- **User Authentication**
  - Registration for volunteers and shelters
  - Secure login/logout
  - User profiles

- **Animal Management**
  - Browse animals with advanced filtering
  - View detailed animal profiles
  - Add animals to favorites
  - Report found animals

- **Shelter System**
  - Shelter profiles and information
  - Animal listings by shelter
  - Contact shelters directly

- **Volunteer Features**
  - Dashboard for volunteers
  - Favorites management
  - Found pet reporting

- **Shelter Dashboard**
  - Manage animals (add, edit, delete)
  - Process found animal reports
  - View and respond to messages

- **Messaging System**
  - Direct communication between users and shelters
  - Message history

- **Donation System**
  - Support shelters with donations

### In Development

- **Advanced Filtering & Search**
  - More refined filtering options for animals
  - Map-based search by location

- **User Dashboard Enhancement**
  - Statistics and reporting for shelters
  - Activity tracking for volunteers

- **Adoption Application Process**
  - Structured adoption applications
  - Application tracking and management

- **Volunteer Certification System**
  - Recognition for volunteer contributions
  - Achievements and badges

- **Mobile Application**
  - Native mobile experience

## 🚦 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/findtail.git
   cd findtail
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.




## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*FindTail is a project created with love to help animals affected by the war in Ukraine find new homes.*
