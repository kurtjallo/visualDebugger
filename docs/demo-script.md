# FlowFixer Demo Script (2 Minutes)

**Target**: Show how FlowFixer turns every error into a lesson and every AI fix into a teachable moment.

---

## Pre-Demo Checklist

- [ ] VS Code open with FlowFixer extension installed and enabled
- [ ] Demo app project open (`/Users/kurt/Documents/Hackathons/CHD/demo-app/`)
- [ ] Terminal ready to run `npm run dev` (port 5173)
- [ ] Gemini API key configured via `FlowFixer: Set Gemini API Key` command
- [ ] Browser tab open to `http://localhost:5173`
- [ ] Start on **"User Profiles"** tab in the demo app (runtime bug)
- [ ] GitHub Copilot or Cursor AI enabled and ready
- [ ] FlowFixer Error Panel visible in VS Code sidebar
- [ ] `BrokenRuntime.tsx` file ready to open
- [ ] Backup: Pre-recorded 30-second demo video ready (if live demo fails)

---

## The Script

### **0:00 – 0:15 | Pitch the Problem**

**Script:**
> "Every day, millions of students hit error messages they can't read. They copy-paste into ChatGPT, accept the fix, and move on — never understanding what went wrong. They're coding, but they're not learning. FlowFixer changes that."

**Action:**
- Stand confidently, make eye contact with judges
- Gesture toward the screen showing VS Code

---

### **0:15 – 0:30 | Show the Broken App**

**Script:**
> "Here's a simple React app a student is building. They click to the User Profiles page and — crash. A wall of red they can't decode."

**Action:**
1. Switch to browser showing `http://localhost:5173`
2. Click **"User Profiles"** tab
3. App crashes with error overlay:
   ```
   TypeError: Cannot read properties of undefined (reading 'map')
   ```
4. Point to the error message on screen
5. Switch back to VS Code

---

### **0:30 – 0:50 | Phase 1: FlowFixer Explains**

**Script:**
> "But FlowFixer catches this error instantly. It tells the student exactly where the bug is, what the error message means in plain English, and how to fix it. The student now UNDERSTANDS the bug before touching anything."

**Action:**
1. FlowFixer Error Panel opens automatically in VS Code sidebar
2. Point to each section as you mention it:
   - **Error badge**: `[Runtime Error]`
   - **Location**: `line 8, BrokenRuntime.tsx`
   - **Plain English explanation**: "You're trying to use .map() on a variable that doesn't exist yet..."
   - **How to Fix**: "Initialize the useState with an empty array: useState([])"
   - **How to Prevent**: "Always provide default values for useState"
   - **Best Practices**: "Use optional chaining (?.) or default values"
3. Scroll slowly through the explanation (3-5 seconds)

---

### **0:50 – 1:10 | Student Asks AI to Fix**

**Script:**
> "Now the student asks their AI assistant to fix it — just like they normally would."

**Action:**
1. Open `BrokenRuntime.tsx` in the editor (should show line 8 with the bug)
2. Highlight the buggy line:
   ```tsx
   const [users, setUsers] = useState();
   ```
3. Invoke GitHub Copilot/Cursor:
   - Type in chat: **"fix this error"**
   - Or use inline suggestion
4. AI modifies the file to:
   ```tsx
   const [users, setUsers] = useState([]);
   ```
   And possibly adds optional chaining:
   ```tsx
   {users?.map(user => ...)}
   ```
5. Save the file (`Cmd+S`)

---

### **1:10 – 1:30 | Phase 2: FlowFixer Reviews the Fix**

**Script:**
> "But here's where FlowFixer shines. Instead of blindly accepting, the student sees exactly what the AI changed — red is removed, green is added — with a clear explanation of WHY this fixes the problem. Every AI fix becomes a teachable moment."

**Action:**
1. FlowFixer Diff Panel opens automatically in VS Code sidebar
2. Point to the visual diff:
   - **Red highlight** (removed): `const [users, setUsers] = useState();`
   - **Green highlight** (added): `const [users, setUsers] = useState([]);`
3. Point to the explanation:
   - "The AI initialized useState with an empty array..."
   - "This prevents the error because .map() now has a valid array to work with..."
   - "Optional chaining (?.) adds extra safety..."
4. Pause for 2-3 seconds so judges can read

---

### **1:30 – 1:45 | Dashboard**

**Script:**
> "Over time, FlowFixer tracks your bug patterns. This student struggles most with runtime errors — FlowFixer knows, and recommends focusing on defensive programming."

**Action:**
1. Run command: `FlowFixer: Show Dashboard` (or click Dashboard button)
2. Dashboard opens showing:
   - **Bar chart**: Runtime (8), Logic (5), Syntax (3)
   - **Trend line**: Showing improvement over time
   - **Focus area**: "You're making great progress! Focus next on: Runtime Error Prevention"
3. Point to the bar chart
4. Point to the recommendation

---

### **1:45 – 2:00 | Close**

**Script:**
> "FlowFixer turns every error into a lesson and every AI fix into a teachable moment. Students don't just vibe code — they learn to code. Built with Gemini for AI explanations, MongoDB Atlas for persistence, ElevenLabs for accessibility, and deployed on DigitalOcean. Thank you."

**Action:**
- Smile, make eye contact
- Gesture toward the screen one last time
- Step back confidently
- Be ready for Q&A

---

## Backup Plan

| **Issue** | **Backup Action** |
|-----------|-------------------|
| Gemini API fails or is slow | Extension has cached responses for all 3 demo bugs (BrokenSyntax, BrokenLogic, BrokenRuntime). The explanation will still appear instantly. |
| App doesn't crash on "User Profiles" click | Manually trigger by editing `BrokenRuntime.tsx` to remove `[]` from `useState([])`, then refresh browser. |
| Diff detection misses the AI fix | Have a pre-recorded 30-second backup video showing the full flow. Play it from the 1:10 mark. |
| Everything fails (API, extension, app) | Show the pre-recorded backup video from 0:00. Narrate over it. |
| Browser/localhost issues | Use screenshots or the backup video. Focus on the VS Code panels. |

---

## Bug Reference (For Testing/Backup)

| **Bug** | **File** | **Category** | **Error** | **How to Trigger** |
|---------|----------|--------------|-----------|-------------------|
| Missing `)` in JSX return | `BrokenSyntax.tsx` | Syntax | `SyntaxError: Unexpected token` | Load the file, save it. Red squiggly appears. |
| `<=` instead of `<` in loop | `BrokenLogic.tsx` | Logic | No crash, extra empty item in list | Run app, click "Loop Bug" tab, see 6 items instead of 5. |
| `.map()` on undefined state | `BrokenRuntime.tsx` | Runtime | `TypeError: Cannot read properties of undefined (reading 'map')` | Run app, click "User Profiles" tab, app crashes. |

---

## Timing Breakdown

| **Time** | **Section** | **Duration** |
|----------|-------------|--------------|
| 0:00 – 0:15 | Pitch the Problem | 15s |
| 0:15 – 0:30 | Show the Broken App | 15s |
| 0:30 – 0:50 | Phase 1: FlowFixer Explains | 20s |
| 0:50 – 1:10 | Student Asks AI to Fix | 20s |
| 1:10 – 1:30 | Phase 2: FlowFixer Reviews the Fix | 20s |
| 1:30 – 1:45 | Dashboard | 15s |
| 1:45 – 2:00 | Close | 15s |
| **Total** | | **2:00** |

---

## Key Talking Points (If Asked)

- **Why Gemini?** Fast, reliable, great at plain-English explanations for technical concepts.
- **Why MongoDB Atlas?** Student bug history needs to persist across sessions; MongoDB is fast and scalable.
- **Why ElevenLabs?** Accessibility — students with visual impairments or reading disabilities can hear explanations read aloud.
- **Why DigitalOcean?** Simple, affordable deployment for the backend API.
- **What makes FlowFixer different?** It's the only tool that combines error explanation AND AI fix review in one flow. Students learn from both their mistakes AND the solutions.

---

## Practice Tips

1. **Run through the script 3-5 times** before the demo.
2. **Time yourself** — aim for 1:50 to leave buffer.
3. **Practice the "disaster recovery"** — if something breaks, smoothly transition to backup.
4. **Test all 3 bugs** (Syntax, Logic, Runtime) so you can pivot if needed.
5. **Have the dashboard pre-populated** with realistic data (not empty).
6. **Speak clearly and confidently** — judges need to understand the value prop in 15 seconds.

---

## Post-Demo Q&A Prep

**Expected Questions:**
- "How accurate is the error explanation?" → Gemini-powered, tested on 100+ common student errors.
- "Does it work with other AI tools?" → Yes, designed to work with Copilot, Cursor, ChatGPT, any tool that edits files.
- "How do you detect AI changes?" → File system watcher + diff algorithm tracking all edits.
- "What about privacy?" → All data is opt-in, stored securely in MongoDB Atlas, student owns their data.
- "Can teachers use this?" → Yes, dashboard shows class-wide bug trends (roadmap feature).

---

**End of Script**
