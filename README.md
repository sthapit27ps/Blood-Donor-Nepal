    # Blood Donor Nepal (रक्तदान नेपाल)

Blood Donor Nepal is a web application designed to help people find blood donors across Nepal.

I built this project to explore how a simple web application could handle donor registration, blood requests, verification, and basic administration while working with HTML, CSS, and JavaScript.

The project does not use any frameworks or require a build process.

It was intended just for a prototype that I did for an summer break internship. 

**By sthapit27ps**

## Features

### For Users

* Register as a blood donor
* Submit KYC information including citizenship number and card photo
* Find verified donors by blood group and area
* Request blood by providing:

  * Blood group
  * Number of units
  * Hospital
  * Area
  * Urgency
* Exchange blood types with other families through the exchange board
* Check whether you are eligible to donate
* Donor badges based on donation history:

  * Bronze
  * Silver
  * Gold

### For Admins

The application also includes a basic admin dashboard.

**Demo password:** `admin123`

Admins can:

* View donor statistics by blood group
* Approve, fulfil, or reject blood requests
* Verify, reject, or block users
* View application activity
* Export activity data as CSV

## Technologies Used

* HTML
* CSS
* JavaScript
* Browser LocalStorage

No frameworks or build tools are required.

## How to Run

Clone or download the repository and open:

```text
index.html
```

in a browser.

That's all that is required to run the current version.

## Project Structure

```text
Blood-Donor-Nepal/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    └── app.js
```

### `index.html`

Contains the main application layout, pages, forms, and footer.

### `css/style.css`

Contains the styling and responsive design for the application.

### `js/app.js`

Contains the application logic, data, settings, pages, and event handling.

## Deploying with GitHub Pages

This project can be hosted directly using GitHub Pages.

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Branch**, select `main`.
4. Select `/ (root)` and save.

The website will be available at:

```text
https://YOUR-USERNAME.github.io/REPO-NAME/
```

## Things to Change

### GitHub and LinkedIn

In `index.html`, search for:

```text
YOUR-GITHUB-USERNAME
YOUR-LINKEDIN-USERNAME
```

and replace them with your usernames.

### Admin Password

The demo admin password can be changed in:

```text
js/app.js
```

Look for:

```text
ADMIN_PASSWORD
```

### Blood Groups and Areas

The available blood groups and areas can also be modified in:

```text
js/app.js
```

Look for:

```text
AREAS
TYPES
```

## Current Limitations

This version uses browser LocalStorage instead of a real backend.

Because of this:

* Data is stored separately in each user's browser
* Users cannot see each other's registrations or requests
* KYC photos are not uploaded to a server
* The admin system is only a frontend demonstration
* The admin password is visible in the source code
* There is no real user authentication
* There is no centralized donor database

This version should therefore be treated as a learning/demo project and not as a real blood donation service.

## Future Improvements

The next step would be turning this into a proper full-stack application.

Some improvements I would like to add:

1. Replace LocalStorage with Firebase or Supabase
2. Add real authentication using email or phone OTP
3. Add secure KYC document storage
4. Add proper admin authentication and authorization
5. Add Nepali and English language support
6. Add SMS or WhatsApp notifications for urgent requests
7. Add location-based donor searching
8. Improve privacy and security around user information
9. Add donor donation history and profiles

## Why I Built This

I wanted to build something more practical than a basic frontend project.

The idea was to create a simple platform where people could register as donors and search for available donors based on blood group and location.

While building it, I also got to work with JavaScript data handling, LocalStorage, forms, admin dashboards, user verification concepts, and some of the security and privacy considerations that come with handling personal information.

This is currently a learning project, but it gives me a foundation that I can later develop into a proper full-stack application.

## Disclaimer

Blood Donor Nepal is a student/learning project and is not currently a real medical or blood donation service.

It should not be used to coordinate real emergency blood donations or make medical decisions.

---

**By sthapit27ps**
