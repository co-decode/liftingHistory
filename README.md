# My Lifting Record

_An application for recording weightlifting data, tracking progress and planning programs_

## Technologies Used:

**In the Back End:**

- Evironment: Docker
- Database: PostgreSQL
- Server: NodeJS, Express, PG, passportJS, bcrypt

**In the Front End:**

- Environment: create-react-app
- Framework: React
- User Interface: CSS
- AJAX: Axios

**Deployment:**

- Database and Server: Heroku
- Client: Netlify

Testing: Jest, React Testing Library, Supertest

Version Control: Git and Github

## out of date, requires updating...
VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

## Components and Features:

My Lifting Record features three major components:

- The Record Display
- The Options bar
- The Entry form

My Lifting Record takes some time to make requests of its database, so there is a loading spinner which is on display next to the page text logo in the top left hand corner whenever network requests are being processed. A useReducer hook is used to track this as state.

The favicon image for this project was obtained from svgrepo.com under a CC0 licence.

### The Record Display:

The record display features:

- A responsive grid of mapped workout records, obtained via SQL queries executed with Axios.

Each mapped element displays the date of the entry, its workout alias, and the specifics of the exercises performed within an expandable details element.

Media queries adapt the grid for smaller screen sizes. Four columns collapse to two columns below 700px, and two columns collapse to one column below 420px.

Entries may be deleted by click on the **Delete Entry** button, which sends a DELETE request to the database through Axios. The browsers default Confirm dialogue is invoked before permitting the request to ensure the user does not unwillingly delte entries.

Users may also change the details of the entry by click the **Edit Entry** button and opening the Update Form. The update is pre-filled with the current values for the entry, ensuring that the user changes only the fields he/she desires to and does not overwrite unchanged entries with **_null_**. The PUT request is sent through Axios.

### The Options Bar:

The options bar features:

- An Order button, which can toggle the record's display between most recent or oldest sessions.
- A date filter, which can allow the user to specify the range of dates to display sessions for.
- A colour scheme selector

Changing the order sends a new query to the database and updates the display, but mapped session elements maintain their state; if the Update Form for a specific entry was open when the order was switched, this specific entry will maintain this state after the order is switched.

Similarly, the date filter will not interfere with the ordering state. If the record display was ordered by most recent before being filtered, it will still be ordered by most recent after the filter is applied.

The colour scheme selector stores changes in local storage, so users can reload the application with their theme selection preserved.

### The Entry Form:

The entry form is revealed by clicking the **Add an Entry** button at the bottom of the page, underneath the record display.

Filling the form out and clicking the **Submit Entry** button makes a POST request to the database through Axios. A message will be displayed upon the successful submission of the data, and the record display will be updated to include the new session.
