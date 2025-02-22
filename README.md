# File Uploader Project
## Overview

- This project is a File Uploader application built as part of [The Odin Project](https://www.theodinproject.com) curriculum. It allows users to upload files to a server, view uploaded files, and manage them. The project demonstrates key concepts in web development, including file handling, backend storage, and user interface design.
- Live Website -> [Here](https://filevault.koyeb.app/)

## Features
- **Folder Creation**: Users can create, update, and delete folders to the server.

- **File Upload**: Users can upload files (e.g., images, documents) to the server.
- **File List**: Displays a list of uploaded files with details such as file name, size, and upload date.
- **File Deletion**: Users can delete uploaded files from the server.

## Technologies Used

- **Frontend**: CSS, Javascript, EJS
- **Backend**: Node.js, Express.js
- **Database**: Postgres
- **File Storage**: Multer (for handling file uploads), Cloudinary (for storing files in the cloud)
- **Other Libraries**: PrismaORM, passport.js (for authentication)

## Screenshots
![image](https://github.com/user-attachments/assets/71031974-394a-4eb1-b1c3-91f4b8bb912d)
![image](https://github.com/user-attachments/assets/c9a27ba7-3820-4252-8841-4c7c8658a751)
![image](https://github.com/user-attachments/assets/93261f65-96a9-449c-8818-5de82825c690)



## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/file-uploader.git
    cd file-uploader
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
  
3. **Set up environment variables**:
Create a .env file in the root directory and add the following:

    ```env
    DATABASE_URL=
    SESSION_SECRET=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    ```
4. **Start the server**:

    ```bash
    npm start
    ```

5. **Access the application**:
    Open your browser and navigate to http://localhost:3000