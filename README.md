# My Lifting Record

_An application for recording weightlifting data, tracking progress and planning programs_

## Technologies Used:

**In the Back End:**

- Environment: Docker
- Database: PostgreSQL
- Server: NodeJS, Express, PG, passportJS, bcrypt

**In the Front End:**

- Environment: create-react-app
- Framework: React
- User Interface: SASS
- AJAX: Axios

**Deployment:**

- Database and Server: Railway
- Client: Netlify

Testing: Jest, React Testing Library, Supertest

Version Control: Git and Github

## Instructions:

#### Login

1. **Create an Account** by clicking register on the Login page

#### Add a New Entry

2. Your log is empty! Click **Add a New Entry** at the top left of the page to enter some data. Please ensure that the time is correctly set, that data is input for every set specified and that each tag template has been filled out.

#### Log

3. When the log has been populated with some session data, use the date filter to view sessions that occured within a specific time frame, or open the exercise filter to filter by exercise, or even by tags indicating exercise variation

#### Calendar

4. To view a visualisation of when each of your sessions occured, click on the Calendar link at the top of the page. Click the colours button at the top of the page to customise how each exercise is indicated on the calendar. Click on the date of a session that you are interested in to view it in more detail.

#### Breakdown

5. The breakdown page will give you statistics and aggregates related to your session, such as the total amount of weight moved and the average weight per set. When you are done, you can return to the calendar at the month of this session or to the main Log page.

#### Graph

6. To view a line graph detailing statistics about your weightlifting data over time, click on the Graph link at the top of the Log page. Use the filters to set the interval you want to group sessions by, the exercise and its variations you want to view and the time period you are interested in.

#### Table

7. You may also view more statistics by switching over to the Table page, either from the Graph page or the Log page.

#### Calculator

8. As an added utility, a weight equivalence calculator is included for planning future weightlifting sessions.

9. When you are done, you may log out of Lifting Log by hovering over your user name in the top right corner of the screen and then clicking "Log Out".
