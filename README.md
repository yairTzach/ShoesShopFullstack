# Shoe Shop: E-Commerce Platform

## Main Page
**URL:** `http://localhost:3000/html/main.html`

## Project Overview
Shoe Shop is a full-featured e-commerce platform built using Node.js and Express.js, allowing users to browse, search, and purchase shoes. The platform provides user authentication, product reviews, personalized recommendations, and secure data handling using both MongoDB and a file system. This application includes various functionalities such as user registration, profile management, shopping cart, purchase history, and an admin panel for product and review management. It leverages MongoDB for dynamic data storage while also utilizing file system management for data backup and other storage needs.

## Features
- **User Authentication:** Sign up, sign in, and logout functionalities.
- **Profile Management:** Users can update their username, email, password, address, and phone number.
- **Product Browsing:** Users can browse, search, and sort shoes by various criteria.
- **Shopping Cart:** Users can add shoes to their cart and complete purchases.
- **Purchase History:** Users can view their past purchases and leave reviews for products they've bought.
- **Product Reviews:** Users can rate and review products they have purchased. The average rating is displayed on each product.
- **Public Reviews:** Users can see all the reviews from other users on the site.
- **Admin Panel:** Admins can manage products, including adding, updating, and removing them, and can also remove user reviews.

## Project Structure
```plaintext
shoeshop/
├── models/                 
│   ├── Product.js           
│   ├── Review.js          
│   ├── User.js             
│   └── products.json       
│
├── node_modules/           
│   └── [dependencies]      
│
├── userData/                 
│   └── [product files]     
│
├── public/                 
│   ├── css/
│   │   ├── activityLog.css
│   │   ├── admin.css
│   │   ├── cart.css
│   │   ├── login.css
│   │   ├── main.css
│   │   ├── profile.css
│   │   ├── publicReview.css
│   │   ├── purchaseHistory.css
│   │   ├── readme.css
│   │   ├── style.css
│   │   ├── submitReview.css
│   │   ├── thankYou.css
│   │   └── thankYouReview.css
│   ├── html/
│   │   ├── activityLog.html
│   │   ├── admin.html
│   │   ├── cart.html
│   │   ├── lm.html
│   │   ├── login.html
│   │   ├── main.html
│   │   ├── profile.html
│   │   ├── publicReviews.html
│   │   ├── purchaseHistory.html
│   │   ├── readme.html
│   │   ├── security.html
│   │   ├── submitReview.html
│   │   ├── thankYou.html
│   │   └── thankYouReview.html
│   ├── js/
│   │   ├── activityLog.js
│   │   ├── admin.js
│   │   ├── cart.js
│   │   ├── login.js
│   │   ├── main.js
│   │   ├── profile.js
│   │   ├── publicReviews.js
│   │   ├── purchaseHistory.js
│   │   ├── register.js
│   │   ├── security.js
│   │   ├── submitReview.js
│   │   ├── thankYouReview.js
│   │   └── test/
│   │       └── test.js       
│
├── routes/                 
│   ├── adminRouter.js      
│   ├── adminTrackRouter.js 
│   ├── authRouter.js       
│   ├── cartRouter.js       
│   ├── mainPageRouter.js   
│   ├── profileRouter.js    
│   ├── purchaseHistoryRouter.js  
│   ├── registerRouter.js   
│   ├── submitReviewRouter.js 
│   ├── publicReviewsRouter.js 
│   ├── thankYouRouter.js   
│   └── ThankYouReviewRouter.js    
│
├── utils/                  
│   └── persist.js          
│
├── userData/
│   └── [user data files]  
│
├── .env                    
├── server.js                  
├── package.json            
└── READMEinstructions.html               

```
## Installation & Setup

## Prerequisites
- **Node.js:** Ensure Node.js is installed on your machine.
- **MongoDB:** Install MongoDB on your machine.

## Step 1: Prepare the Project Directory
1. Download the provided zip file containing the project to your computer.
2. Locate the downloaded zip file and right-click on it to extract its contents. This will create a folder with all the project files.
3. Open your terminal application (on Windows, you can use Command Prompt or PowerShell; on macOS and Linux, you can use the Terminal app).
4. In the terminal, use the `cd` (change directory) command to navigate to the extracted project folder:

## Step 2: Install Dependencies
Once you are inside the project folder in the terminal, run the following command to install all the necessary dependencies:
npm install

## Step 3: Start the Application
To start the application, run the following command in the terminal:
node server.js

## The app should now be running on http://localhost:3000/html/main.html


## Running Tests

## How to Run Tests:
## 1. Ensure your MongoDB server is running. If it's not running, you'll need to start it first.
## 2. If your application is already running in one terminal, open a new terminal window or tab.
## 3. Navigate to the public/js/test directory where the test file is located:

cd /path/to/your/project/public/js/test

## 4. Install the necessary dependencies for running the tests:

npm install

## 5. Finally, run the test script using the following command:

node test.js

## This script will execute tests for your routes and functionalities to ensure everything is working correctly. 
## If the tests pass, you will see output in the terminal indicating success. If any test fails, the output will show 
## which test failed and the type of error.


![Project Logo](logo.webp)
