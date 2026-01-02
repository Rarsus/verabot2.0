# Opt-In Communication System Guide

Welcome to VeraBot's opt-in communication system! This guide explains how the system works, why it's important, and how to use it.

## Quick Summary

VeraBot lets you **control whether you want to receive direct messages** from the bot. When someone creates a reminder for you but you haven't opted in, they'll be notified and given choices about how to proceed. You stay in control of your communication preferences!

## For Users: Managing Your Preferences

### What is "Opting In"?

Opting in means you've given permission to VeraBot to send you direct messages (DMs). This is primarily used for:
- **Reminder notifications** - When someone creates a reminder assigned to you
- **Opt-in requests** - When someone asks you to opt in so they can send you reminders

### How to Opt In

**Command:** `/opt-in`

Simply use the `/opt-in` command to enable direct messages from VeraBot. That's it!

```
/opt-in
```

**Response:** You'll get a confirmation message that you've opted in.

### How to Opt Out

**Command:** `/opt-out`

If you change your mind and no longer want to receive DMs from VeraBot, use this command:

```
/opt-out
```

**Response:** You'll get a confirmation message that you've opted out.

### Check Your Status

**Command:** `/comm-status`

Not sure if you're opted in? Use this command to check:

```
/comm-status
```

**Response:** You'll see your current opt-in status and the date it was last updated.

## For Reminder Senders: Understanding the Flow

### What Happens When You Create a Reminder?

When you use `/create-reminder` to create a reminder for someone:

1. **If they're opted in** ✅
   - Reminder is created normally
   - They'll receive a DM when the reminder triggers

2. **If they're opted out** ❌
   - You'll see a decision prompt with 3 options:

### Decision Options for Opted-Out Users

When someone hasn't opted in, you have three choices:

#### Option 1: Cancel ❌
- **Button:** "❌ Cancel"
- **What happens:** The reminder is not created
- **When to use:** If you realize you don't need to send the reminder

#### Option 2: Create (Server-Only) 📋
- **Button:** "📋 Create (Server-Only)"
- **What happens:** The reminder is created, but notifications will only appear in the server (not as DM)
- **Limitations:** The user won't get a personal notification - they'll only see it if they're actively in the server
- **When to use:** For reminders that aren't urgent or time-sensitive

#### Option 3: Notify User 📢
- **Button:** "📢 Notify User"
- **What happens:** 
  - The reminder is created
  - An opt-in request is sent to the user
  - If they opt in, they'll be notified when the reminder triggers
- **When to use:** For important reminders that the user really should know about

### Example: Creating a Reminder

Let's say you want to remind Alex about a meeting:

```
/create-reminder
subject: Team Meeting
when: tomorrow at 2 PM
who: @Alex
```

**Scenario 1: Alex is opted in**
- ✅ Reminder created successfully
- ✅ Alex will get a DM when the reminder triggers

**Scenario 2: Alex is not opted in**
- ⚠️ You'll see a decision prompt
- Choose one of the three options above

## For Requesters: Asking Someone to Opt In

### Use the Opt-In Request Command

**Command:** `/opt-in-request`

If someone's opted out and you want to ask them to opt in:

```
/opt-in-request
user: @Someone
reason: (optional) "I need to send you important reminders"
```

**What happens:**
1. The user receives a DM from VeraBot
2. The DM explains that someone wants them to opt in
3. They can click a button to opt in directly

**When to use:** 
- When you frequently need to send reminders to someone
- When you want to explain why you're asking
- As a more personal alternative to the automatic prompt

## Example Workflows

### Workflow 1: Creating a Reminder for Someone Who's Opted In

```
You:    /create-reminder subject:"Project Due" when:"Friday 5pm" who:@Jane
Bot:    "✅ Reminder #42 created successfully for @Jane!"
Jane:   (receives DM Friday at 5pm) "📌 Project Due - Reminder #42"
```

### Workflow 2: Creating a Reminder When User Hasn't Opted In

```
You:    /create-reminder subject:"Review Docs" when:"Tomorrow 10am" who:@Bob
Bot:    "⚠️ Bob hasn't opted in. What would you like to do?"
        [❌ Cancel] [📋 Create Server-Only] [📢 Notify User]
You:    [Click: 📢 Notify User]
Bot:    "✅ Reminder created. Sent opt-in request to Bob."
Bob:    (receives DM) "📢 Someone wants to send you reminders. Click to opt in!"
Bob:    [Click: Opt In]
Bob:    (next day at 10am) "📌 Review Docs - Reminder #..."
```

### Workflow 3: Manually Requesting Opt-In

```
You:    /opt-in-request user:@Chris reason:"Need to send you team updates"
Chris:  (receives DM) "You're invited to opt in for reminders from @You"
Chris:  [Click: Opt In]
You:    (in server) "✅ Chris is now opted in to communication"
```

## Privacy & Control

- **Your Choice:** Opting in is always your decision
- **Reversible:** You can opt out anytime with `/opt-out`
- **No Hidden DMs:** You'll never receive reminder DMs without opting in first
- **Transparent:** You can always check your status with `/comm-status`

## FAQ

**Q: What happens if I opt out and someone sends me a reminder?**
A: They'll be given options to cancel, create it server-only, or send you an opt-in request. You won't receive unwanted DMs.

**Q: Can I opt in for some people but not others?**
A: Currently, opting in applies to all reminders from any sender. This is a global communication preference.

**Q: Will I get spammed if I opt in?**
A: No. You only get reminders that people specifically create for you. People can't spam - only the reminder creator decides when reminders are sent.

**Q: What's the difference between server-only and DM reminders?**
A: 
- **Server-only:** Reminder appears in a designated server channel, visible to anyone in the server
- **DM:** You get a personal direct message when the reminder triggers

**Q: Can I undo opting out?**
A: Yes! Use `/opt-in` to re-enable DMs anytime.

**Q: How long does the opt-in request last?**
A: There's no expiration. They can opt in anytime they see the request.

## Troubleshooting

**Problem:** I don't see my opt-in confirmation
- **Solution:** Check that DMs from VeraBot are enabled in your Privacy settings

**Problem:** I'm not getting reminders even though I opted in
- **Solution:** 
  1. Run `/comm-status` to confirm you're opted in
  2. Check that VeraBot can send you DMs
  3. Ask the reminder sender to verify they created the reminder

**Problem:** Someone can't receive my opt-in request
- **Solution:** They might have DMs disabled. Ask them to enable DMs from server members, then try again.

**Problem:** I can't find the opt-in button in a DM
- **Solution:** Make sure you're viewing the full message. The button should be below the text.

## Commands Reference

| Command | What it does | Example |
|---------|-------------|---------|
| `/opt-in` | Enable DMs from VeraBot | `/opt-in` |
| `/opt-out` | Disable DMs from VeraBot | `/opt-out` |
| `/comm-status` | Check your current opt-in status | `/comm-status` |
| `/opt-in-request` | Ask someone to opt in | `/opt-in-request user:@John reason:"For reminders"` |
| `/create-reminder` | Create a reminder (uses opt-in system) | `/create-reminder subject:"Meeting" when:"tomorrow 3pm" who:@Jane` |

## Need Help?

- **With commands?** Use the `/help` command in the server
- **Report a bug?** Contact the server administrators
- **Feature request?** Suggest it to the server administrators

---

**Last Updated:** December 2024  
**Version:** 1.0
