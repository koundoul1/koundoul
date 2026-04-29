# Audit QA Koundoul — Plan de remédiation
**Total : 125 issues uniques** consolidées depuis l'audit QA externe (5 testeurs).
Une issue rapportée par plusieurs testeurs = priorité accrue (champ `severity`).
---

## 🔴 P0 — BLOQUANTS (Auth + Paiement) — 11 issues

### Authentication (4 issues)

**1. Registration->Email already used** 🔥🔥🔥 _(rapporté par 3 testeurs: Visitor, Student, Student2)_
- **Étapes** : 1. Register with existing email
- **Attendu** : Error message 'Email already in use'
- **Constats** :
  - [Visitor] error msg not showing
  - [Student] ACCOUNT NOT REGISTER and  THE MESSSAGE is ALSO NOT SHOWN, INSTEAD STUCK AT BLANK PAGE.

**2. Login->Wrong password** 🔥🔥🔥 _(rapporté par 3 testeurs: Visitor, Student, Student2)_
- **Étapes** : 1. Enter wrong password 3 times
- **Attendu** : Message 'Email or password incorrect'
- **Constats** :
  - [Visitor] error msg not showing
  - [Student] does not login, no messege appear such as " email or password is incorrect."
  - [Student2] showing nothing

**3. Login->Unknown email** 🔥🔥 _(rapporté par 2 testeurs: Visitor, Student2)_
- **Étapes** : 1. unknown@test.com
- **Attendu** : Appropriate error message
- **Constats** :
  - [Visitor] error msg not showing
  - [Student2] showing nothing

**4. Registration->Mobile registration** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Mobile 2. Complete the form
- **Attendu** : Responsive form, adapted keyboard, no hidden fields

### Subscriptions & Wave Payment (7 issues)

**1. Initiate Wave payment** 🔥🔥 _(rapporté par 2 testeurs: Student, Parent)_
- **Étapes** : 1. Click 'Pay with Wave' 2. Observe
- **Attendu** : Loading spinner, then redirect to Wave page
- **Constats** :
  - [Student] blank page is loaded
  - [Parent] doesnt redirect to wave page

**2. Popular badge** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Observe plans
- **Attendu** : Popular' badge on recommended plan

**3. Payment success page** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /payment/success
- **Attendu** : ✅ animation, 'Subscription Activated!'

**4. Payment error page** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /payment/error
- **Attendu** : Clear error message, Retry button

**5. Active subscription visible** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. After successful payment 2. Profile
- **Attendu** : Active subscription displayed with expiry date

**6. Payment history** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /subscriptions or profile 2. History
- **Attendu** : List of past transactions

**7. Not logged in → /subscriptions** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Not logged in 2. Go to /subscriptions
- **Attendu** : Redirect to /login
- **Constats** :
  - [Student] without login the subscriptions not found

## 🟠 P1 — CŒUR PRODUIT (Apprentissage, Gamification, IA) — 32 issues

### Courses (2 issues)

**1. Progress in course** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Complete a lesson 2. Return to course
- **Attendu** : Progress bar updated
- **Constats** :
  - [Student2] when we open a lesson it shows completed and the progress bar is not updating

**2. Completed course** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Finish all lessons in a course
- **Attendu** : Course completed badge, XP awarded

### Exercises (1 issues)

**1. Exercise XP** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Complete an exercise
- **Attendu** : XP awarded based on difficulty
- **Constats** :
  - [Student] answers can not be submited

### Micro-Lessons (3 issues)

**1. Complete a lesson** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Finish lesson 2. Confirm
- **Attendu** : Green checkmark, XP added, progress updated
- **Constats** :
  - [Student] xp,progress not updated

**2. Already completed lesson** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Reopen completed lesson
- **Attendu** : Already completed' green badge displayed
- **Constats** :
  - [Student] not written already completed
  - [Student2] when we open a lesson for the first time it already marked completed

**3. Next lesson navigation** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. In lesson 2. Click Next
- **Attendu** : Moves to next lesson in sequence
- **Constats** :
  - [Student2] there is not next button

### Quiz (6 issues)

**1. Easy filter (level 1)** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Difficulty: Easy
- **Attendu** : Level 1 questions only (124 available)
- **Constats** :
  - [Student] no difficuilty filters present

**2. Medium filter (level 2)** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Difficulty: Medium
- **Attendu** : Level 2 questions only (468 available)
- **Constats** :
  - [Student] no difficuilty filters present

**3. Hard filter (level 3)** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Difficulty: Hard
- **Attendu** : Level 3 questions only (308 available)
- **Constats** :
  - [Student] no difficuilty filters present

**4. Timer countdown** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Observe timer at top
- **Attendu** : Visible countdown, auto-end at 0
- **Constats** :
  - [Student] does not auto end as the quiz ends

**5. Final score** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Complete quiz
- **Attendu** : Score /10, success %, XP earned displayed
- **Constats** :
  - [Student] xp earned not shown

**6. XP awarded** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. After quiz 2. Check profile
- **Attendu** : XP added to student's total

### Solver (8 issues)

**1. Simple equation** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Enter 'x^2 - 4 = 0' 2. Solve
- **Attendu** : Solutions x=2 and x=-2 displayed
- **Constats** :
  - [Student] error displayed
  - [Student2] Ai not working

**2. LaTeX rendered answer** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Enter complex formula
- **Attendu** : Answer with LaTeX formulas rendered correctly

**3. Interactive graph** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Request graph of f(x)=x²
- **Attendu** : Interactive Plotly chart displayed (zoom, hover)

**4. Plotly lazy loading** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Open DevTools Network 2. Go to /solver
- **Attendu** : Plotly.js loaded ONLY when Solver is opened (not at app start)

**5. Resolution history** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Solve 3 equations
- **Attendu** : History visible or accessible
- **Constats** :
  - [Student] because the solver is not working

**6. Invalid equation** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Enter non-mathematical text
- **Attendu** : Understandable error message

**7. Access Solver** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /solver
- **Attendu** : Problem-solving interface visible

**8. Solver on mobile** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Mobile 2. Enter equation
- **Attendu** : Usable interface, adapted numeric keyboard

### Student Dashboard (6 issues)

**1. Continue button** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Click 'Resume'
- **Attendu** : Redirect to last micro-lesson in progress
- **Constats** :
  - [Student] page not found error 404 appear
  - [Student2] the resume button should not be available on new accounts untill i start a lesson  (it is showing but having issue redirecting)

**2. Hero card — name, XP, streak** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Dashboard 2. Observe hero
- **Attendu** : Student name, total XP, streak days, level displayed correctly
- **Constats** :
  - [Student] but do not update its progress

**3. XP progress bar** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Hero card 2. Progress bar
- **Attendu** : Gold bar graduated by XP/NextLevelXP (e.g. 180/1000)
- **Constats** :
  - [Student] bar is present but the bar is not upgrading with golden colour

**4. 7-day activity grid** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Recent Activity section 2. Observe boxes
- **Attendu** : Colored boxes per activity (Mon/Tue/Wed/Thu/Fri/Sat/Sun)
- **Constats** :
  - [Student] boxes are not filled

**5. 4 key stats** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Stats section 2. Observe
- **Attendu** : Total XP, Lessons /395, Avg Score %, Study Time correct
- **Constats** :
  - [Student] but not working

**6. Badges row** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Badges section 2. Observe
- **Attendu** : Earned badges in gold, locked with 🔒 and condition
- **Constats** :
  - [Student] no condition can be seen

### Virtual Coach (6 issues)

**1. Math question** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. 'Explain the Pythagorean theorem'
- **Attendu** : Pedagogical response generated and displayed
- **Constats** :
  - [Student] displayed but not genersted according to the new measures

**2. Question with formulas** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. 'What is Ohm's law?'
- **Attendu** : LaTeX formulas rendered in the response

**3. Conversation history** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Ask 3 consecutive questions
- **Attendu** : Scrollable history in the interface

**4. Response in chosen language** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Switch to EN 2. Ask question
- **Attendu** : Response in English

**5. Coach on mobile** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Mobile 2. Use coach
- **Attendu** : Keyboard does not hide response area

**6. Response time** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Ask question 2. Observe
- **Attendu** : Loading indicator, response < 10s

## 🟡 P2 — SOCIAL & COMPÉTITION (Duels, Challenges, Leaderboard) — 29 issues

### Badges (5 issues)

**1. Badges page** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /badges
- **Attendu** : 15 badges displayed (earned + locked)
- **Constats** :
  - [Student] nothing shown in badge

**2. Earned badge** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Unlocked badge 2. Check display
- **Attendu** : Gold badge, animation, description

**3. Earn first lesson badge** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Complete first lesson
- **Attendu** : First Lesson' badge unlocked + notification

**4. Badges in dashboard** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Dashboard 2. Badges section
- **Attendu** : Synced with /badges page

**5. 15 badges available** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /badges 2. Count
- **Attendu** : Exactly 15 badges listed

### Challenge Mode & Weekly Challenges (8 issues)

**1. Answer and submit** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Answer 10 questions 2. Submit
- **Attendu** : Score, leaderboard rank, XP awarded

**2. Already completed challenge** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : 1. Try to redo challenge
- **Attendu** : Message 'Already participated this week'

**3. Access Challenge** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /challenge
- **Attendu** : 3 tabs visible: Challenge, Duels, Leaderboard
- **Constats** :
  - [Student] but other names like ranking

**4. 3 active challenges** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Weekly Challenge tab 2. Observe
- **Attendu** : 3 challenges (Math, Physics, Chemistry) displayed
- **Constats** :
  - [Student] only the math challenge can be seen

**5. Complete challenge info** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Challenge card 2. Observe
- **Attendu** : Subject, difficulty, duration 20min, 500 XP, participants
- **Constats** :
  - [Student] xps are not mentioned

**6. Start challenge** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click 'Start Challenge'
- **Attendu** : 10 MCQ questions with 20-minute timer

**7. Challenge rules** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Rules section 2. Observe
- **Attendu** : 4 rules displayed (20min, 10 questions, ranking, rewards)

**8. 20-minute timer** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Start challenge 2. Observe timer
- **Attendu** : Countdown in minutes:seconds visible

### Duels (11 issues)

**1. Create a duel** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Duels tab 2. Create challenge 3. Choose Math + Grade 12
- **Attendu** : Unique invite code generated, share link displayed
- **Constats** :
  - [Student] after pressing create the a blank page appear

**2. Invite code displayed** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. After creation
- **Attendu** : Code in large characters + 'Copy Code' button

**3. Copy code** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click 'Copy'
- **Attendu** : Code in clipboard, 'Copied!' feedback

**4. Join via code** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Enter valid invite code 2. Join
- **Attendu** : Duel starts, questions displayed

**5. Duel questions (10 MCQ)** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Active duel 2. Answer
- **Attendu** : 10 questions with 10-minute timer

**6. Submit duel** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Answer all questions
- **Attendu** : Results: Your score vs Opponent, winner announced

**7. Winner XP +200** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Win a duel 2. Check XP
- **Attendu** : 200 XP added to profile

**8. Loser XP +50** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Lose a duel 2. Check XP
- **Attendu** : 50 XP added to profile

**9. Rematch button** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. End of duel 2. Click Rematch
- **Attendu** : New duel created with same config

**10. My Duels — history** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. My Duels tab
- **Attendu** : W/L/D stats, ongoing duels, history

**11. Duel notification received** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Opponent joins 2. Observe notifications
- **Attendu** : Notification 'Someone joined your challenge!'

### Leaderboard (2 issues)

**1. Access Leaderboard** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /leaderboard
- **Attendu** : Leaderboard page with filters visible

**2. Pagination 20/page** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. More than 20 entries
- **Attendu** : Page navigation functional

### Real-Time Notifications (2 issues)

**1. Red bell badge** 🔥🔥 _(rapporté par 2 testeurs: Student, Parent)_
- **Étapes** : 1. Logged in with unread notifs 2. Observe TopBar
- **Attendu** : 🔔 bell with red badge + count

**2. Types with icons** 🔥🔥 _(rapporté par 2 testeurs: Student, Parent)_
- **Étapes** : 1. Observe notifications
- **Attendu** : Different icons per type: 🏅 badge, ⚔️ duel, 🔥 streak, 💳 payment

### Smart Challenge (1 issues)

**1. Score and feedback** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. End challenge 2. Observe results
- **Attendu** : Score, improvement tips
- **Constats** :
  - [Student] there is no buttos present to end the challenge

## 🟢 P3 — MODULES SECONDAIRES (Flashcards, Forum, Profile, Admin) — 36 issues

### Flashcards (6 issues)

**1. Access Flashcards** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /flashcards
- **Attendu** : List of available decks

**2. Open a deck** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click on a deck
- **Attendu** : First flashcard displayed (front side)

**3. Flip card** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click on the card
- **Attendu** : Flip animation, back side displayed

**4. Card navigation** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click Next/Previous
- **Attendu** : Smooth navigation, counter updated

**5. Mark card as known** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click 'I know it'
- **Attendu** : Card marked, deck progress updated

**6. Deck progress** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. View progress bar
- **Attendu** : % mastered cards displayed

### Forum (7 issues)

**1. Access Forum (logged in)** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Logged in 2. /forum
- **Attendu** : Discussion list visible
- **Constats** :
  - [Student] not forum was created

**2. Create discussion** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. New post 2. Title + content 3. Publish
- **Attendu** : Post created, immediately visible in list

**3. Reply to discussion** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Open post 2. Write reply 3. Send
- **Attendu** : Reply added to thread

**4. Forum not logged in** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Not logged in 2. Try to access /forum
- **Attendu** : Redirect to /login

**5. Forum search** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Search keyword
- **Attendu** : Matching posts filtered

**6. Text formatting** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Post with line break
- **Attendu** : Basic formatting preserved

**7. Pagination/scroll** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. More than 20 posts 2. Scroll
- **Attendu** : Next posts load

### Resources (4 issues)

**1. Filter by subject** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Filter Physics
- **Attendu** : Physics resources only
- **Constats** :
  - [Student] there is a filter but not of subject

**2. Filter by level** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Filter Grade 10
- **Attendu** : Grade 10 resources only
- **Constats** :
  - [Student] there is a filter but not of grades

**3. Open a resource** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Click on resource
- **Attendu** : Content or external link opened (new tab)

**4. Resources not empty** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Observe list
- **Attendu** : At least some resources available

### Settings (6 issues)

**1. Access Settings** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. /settings
- **Attendu** : Settings page accessible
- **Constats** :
  - [Student2] error 404

**2. Toggle notifications** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Disable notifications
- **Attendu** : Preference saved in DB
- **Constats** :
  - [Student2] cannot check

**3. Change language from settings** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Select EN
- **Attendu** : Interface switches to English, persisted
- **Constats** :
  - [Student2] cannot check

**4. Privacy section** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Privacy section
- **Attendu** : Privacy options visible
- **Constats** :
  - [Student2] cannot check

**5. Delete account** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Delete account 2. Confirm
- **Attendu** : Confirmation modal, account deleted, redirect to /login
- **Constats** :
  - [Student2] cannot check

**6. Mobile settings** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Mobile 2. /settings
- **Attendu** : Responsive and accessible interface
- **Constats** :
  - [Student2] cannot check

### Share App (1 issues)

**1. Violet QR code** 🔥🔥 _(rapporté par 2 testeurs: Visitor, Student)_
- **Étapes** : 1. Share modal 2. Observe QR
- **Attendu** : Violet/turquoise QR code pointing to koundoul.com
- **Constats** :
  - [Visitor] aligment issue
  - [Student] QR is not detected by scanner

### Super Admin Panel (8 issues)

**1. Overview KPIs** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. /admin
- **Attendu** : 5 KPIs: Total Users, Active Today, Monthly Revenue, Active Subscriptions, Completed Lessons
- **Constats** :
  - [SuperAdmin] Active today functionality is 
not working

**2. User management** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Users menu
- **Attendu** : Paginated table with all users
- **Constats** :
  - [SuperAdmin] Show all users in one list

**3. Search user by email** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Search 'samba'
- **Attendu** : Users filtered in real-time
- **Constats** :
  - [SuperAdmin] Filters not working

**4. Promote to admin** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. User > Actions > Promote Admin
- **Attendu** : User becomes admin
- **Constats** :
  - [SuperAdmin] The user who become admin needs to logout and login again in order to acces admin modules

**5. Subscription management** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Subscriptions menu
- **Attendu** : List of active/expired/cancelled subscriptions
- **Constats** :
  - [SuperAdmin] list empty

**6. Content stats** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Content menu
- **Attendu** : 395 microlessons, 900 exercises, 900 MCQ, 15 badges
- **Constats** :
  - [SuperAdmin] not showing content

**7. Payment history** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Payments menu
- **Attendu** : Transaction list with Wave/Orange/Card filters
- **Constats** :
  - [SuperAdmin] not showing user name
not updating 
Filters not working

**8. Actions logged** 🔥 _(rapporté par 1 testeur: SuperAdmin)_
- **Étapes** : 1. Perform admin action 2. Check logs
- **Attendu** : Action recorded in admin_logs DB

### User Profile (2 issues)

**1. Profile stats** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Stats section
- **Attendu** : Total XP, streak, lessons, badges correct
- **Constats** :
  - [Student] but not updating

**2. Change password** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Enter old password 2. New password 3. Confirm
- **Attendu** : Password changed, re-login required

### Visualizations (2 issues)

**1. Interactive graph** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. Interact with graph 2. Hover, zoom
- **Attendu** : Data shown on hover, zoom functional
- **Constats** :
  - [Student] interactive in some not all

**2. Load without error** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : 1. /visualizations 2. DevTools Console
- **Attendu** : No JS errors in console
- **Constats** :
  - [Student] error

## ⚪ P4 — POLISH (Landing, Nav, i18n, Responsive, Perf) — 17 issues

### Home (Landing Page) (1 issues)

**1. Landing load speed** 🔥🔥 _(rapporté par 2 testeurs: Visitor, Parent)_
- **Étapes** : 1. DevTools > Network > Disable cache 2. Reload
- **Attendu** : Page visible < 3s on WiFi, < 6s on simulated 3G
- **Constats** :
  - [Visitor] take 11+ sec to reload
  - [Parent] on 3g page took around 11 seconds

### MULTILINGUAL TESTS (FR / EN) (10 issues)

**1. Error messages** 🔥🔥🔥 _(rapporté par 3 testeurs: Visitor, Student, Student2)_
- **Étapes** : Error texts in French
- **Attendu** : Error messages in English

**2. Sidebar Navigation** 🔥🔥 _(rapporté par 2 testeurs: Visitor, Student2)_
- **Étapes** : Accueil, Cours, Micro-Leçons, Résolveur, Quiz...
- **Attendu** : Home, Courses, Micro-Lessons, Solver, Quiz...
- **Constats** :
  - [Visitor] some text are not converted

**3. Subject names** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : Mathématiques, Physique, Chimie
- **Attendu** : Mathematics, Physics, Chemistry

**4. Grade levels** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : Seconde, Première, Terminale
- **Attendu** : 10th Grade, 11th Grade, 12th Grade

**5. Action buttons** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : Commencer, Suivant, Valider, Soumettre
- **Attendu** : Start, Next, Validate, Submit

**6. No raw translation keys** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : Browse all pages in EN
- **Attendu** : No raw translation key visible (e.g. 'nav.home')

**7. Subject filters** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : Filters displayed in FR
- **Attendu** : Filters displayed in EN

**8. Dates and numbers** 🔥🔥 _(rapporté par 2 testeurs: Student, Student2)_
- **Étapes** : FR format (e.g. 'il y a 2 min')
- **Attendu** : EN format ('2 min ago')

**9. Dashboard hero** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : Bonjour [Nom]', 'Jours', 'Niveau'
- **Attendu** : Good morning [Name]', 'Days', 'Level'

**10. Language persistence** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : 1. Choose EN 2. Reload page
- **Attendu** : Interface stays in EN after reload

### Navigation & Interface (1 issues)

**1. FR/EN language selector** 🔥🔥 _(rapporté par 2 testeurs: Visitor, Student2)_
- **Étapes** : 1. Click FR/EN in TopBar 2. Change language
- **Attendu** : Interface switches instantly, choice persisted
- **Constats** :
  - [Visitor] dropdown menu ui issue
  - [Student2] cannnot. translate properly

### PERFORMANCE TESTS (1 issues)

**1. Initial load 3G** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : Chrome DevTools > Network > Slow 3G > Hard reload
- **Attendu** : LCP < 6 seconds
- **Constats** :
  - [Student] taking a bit more time

### RESPONSIVE TESTS (MOBILE / DESKTOP) (4 issues)

**1. Forum** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : Posts in column, floating new post button
- **Attendu** : Posts list + categories sidebar
- **Constats** :
  - [Student] no forum present

**2. Leaderboard** 🔥 _(rapporté par 1 testeur: Student)_
- **Étapes** : Horizontally scrollable table, personal rank visible
- **Attendu** : Full table, podium visible
- **Constats** :
  - [Student] no leader board

**3. Quiz** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : Readable questions, options stacked in column
- **Attendu** : Question + options layout visible without scroll

**4. Challenge / Duels** 🔥 _(rapporté par 1 testeur: Student2)_
- **Étapes** : Horizontally scrollable tabs, adapted form
- **Attendu** : Inline tabs, side-by-side form
