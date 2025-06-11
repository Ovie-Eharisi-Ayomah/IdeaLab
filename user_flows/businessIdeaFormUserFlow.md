Success Scenario
1. User clicks submit
2. Form validates successfully
3. Loading spinner shows
4. API call succeeds → { jobId: "abc-123" }
5. Success message briefly shows
6. User navigated to /results/abc-123
7. Loading state cleared

Validation Error Scenario
1. User clicks submit
2. Form validation fails (text too short)
3. Function returns early
4. User sees validation error messages
5. No API call made

Network Error Scenario
1. User clicks submit
2. Form validates successfully
3. Loading spinner shows
4. Network request fails
5. Error caught and displayed to user
6. Loading state cleared
7. User can try again