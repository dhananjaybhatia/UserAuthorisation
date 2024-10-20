User Authorization and Post Management App

This is an Express.js web application that allows users to register, log in, write posts, edit or delete posts, upload images, and like posts. It uses MongoDB for data storage, EJS for templating, JWT for user authentication, and Multer for handling file uploads.

Features

User Registration: Allows new users to register with a username, name, email, age, and password.
User Login: Users can log in and receive a JWT token for authentication.
User Profile: Displays the user’s information and posts. Users can upload profile images.
Posts: Users can write, edit, and delete posts. Posts can be liked and unliked.
Image Upload: Users can upload profile images via Multer, and the image is saved on the server.
User Authentication: Protects routes like profile, post creation, and edit using JWT tokens.
Logout: Users can log out, and their session is cleared.
Technologies

Express.js: Web framework for handling requests and routing.
EJS: Templating engine for rendering dynamic views.
Mongoose: MongoDB ODM to handle database operations.
JWT: JSON Web Tokens for user authentication.
Bcrypt: For hashing passwords.
Multer: Middleware for handling multipart/form-data (for image uploads).
Cookie-Parser: For parsing cookies.
Dotenv: To load environment variables.
