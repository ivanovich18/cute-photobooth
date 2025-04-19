# ✨ Cute Photobooth Web App ✨

A fun and interactive web-based photobooth application that allows users to capture moments using their camera and generate a unique, customizable photo strip, just like a real photobooth! This project was built as a portfolio piece to showcase frontend development skills.

## 🔗 Live Demo

You can try the live version of the photobooth here:

https://ivanovich18.github.io/cute-photobooth/

## 📸 Features

- Accesses user's webcam or phone camera.
- Captures up to 4 photos in a sequence.
- Includes a 3-second countdown timer before each photo capture.
- Automatically captures the 2nd, 3rd, and 4th photos after the timer, following the initial click.
- Allows pausing and resuming the automatic capture sequence.
- Generates a vertical photo strip (600px x 1800px) with equal padding around and between photos, and a designated area for text at the bottom.
- Customization options for the strip's background color and text content, color, and vertical placement.
- Displays captured photos as small previews.
- Provides a "View Strip!" option to see the final photo in a full-screen modal popup.
- Allows downloading the final photo strip as a JPG image.
- Designed with a cute and user-friendly interface.

## 💻 Technologies Used

- **React:** Frontend JavaScript library for building the user interface.
- **HTML5 Canvas API:** Used for drawing and combining the captured images, background, and text into a single final image on the client-side.
- **`react-webcam`:** A React component wrapper for accessing the user's webcam via the `getUserMedia` browser API.
- **CSS:** For styling the application and creating the cute photobooth look.
- **JavaScript (ES6+):** Core language logic, handling browser APIs, state management, and timing.

## ▶️ Setup and Running Locally

To get a copy of the project up and running on your local machine for development and testing:

1.  **Clone the repository:**

    ```bash
    git clone [Your Repository URL]
    cd cute-photobooth-app
    ```

    _(Replace `[Your Repository URL]` with the URL of your GitHub/GitLab/Bitbucket repository)_

2.  **Install dependencies:**

    ```bash
    npm install
    # or if you use yarn
    yarn install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    # or if you use yarn
    yarn start
    ```
    The app should open in your browser at `http://localhost:3000/`.

## 💡 Future Enhancements

Possible future features include:

- Adding more customization options (fonts, borders, stickers).
- Implementing different collage layouts.
- Allowing users to upload their own graphics/logos to add to the strip.
- Adding image filters.
- Improving performance for high-resolution captures.

## 👤 Author

- [Ivan Suralta ](https://www.linkedin.com/in/ivan-suralta/)
