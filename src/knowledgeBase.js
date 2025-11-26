// Export default array to avoid "export 'default' was not found" issue.
// Add/extend Q&A items as needed.

const knowledgeBase = [
  { question: "how do i upload a file", answer: "Go to Documents → Upload. Click the big upload box, enter a password to secure the file, then choose files. The file will be uploaded encrypted." },
  { question: "how to retrieve a file", answer: "Use Retrieve tab, search by filename or keyword, then provide the password or OTP to decrypt and download." },
  { question: "what file types are supported", answer: "Images (jpg, png), PDFs, Word documents (.doc, .docx). The front-end accepts other common document types, you can extend backend to support more." },
  { question: "how is the file secured", answer: "Files are encrypted client-side or server-side (implement AES-256). A password or OTP is required to decrypt when retrieving." },
  { question: "how to send otp", answer: "Implement backend email service (SMTP or third-party like Brevo) to send OTPs to the user's registered email during retrieval or upload verification." },
  { question: "where are files stored", answer: "Files are intended to be stored in a cloud storage bucket (S3 / Supabase Storage). Configure backend to store and fetch securely." },
  { question: "can i upload multiple files", answer: "Yes — the upload allows selecting multiple files at once." },
  { question: "how to delete a file", answer: "In Uploaded Files tab press the delete icon to remove a file (this should trigger a backend delete request)." },
  { question: "what is securedoc ai", answer: "SecureDoc AI is an app that stores documents securely and provides an AI chatbot for searching and summarizing documents." },
  { question: "how to integrate s3", answer: "On backend, use AWS SDK (aws-sdk v3) to upload files to an S3 bucket. Store metadata and object keys in DB." },
  { question: "can i share a file", answer: "Implement secure-sharing: generate a one-time link and require password/OTP to download." },
  { question: "is there a size limit", answer: "Implement server-side checks. For demo this frontend has no enforced limit." },
  { question: "how to summarize a pdf", answer: "Use a PDF reader (PyPDF2) to extract text and pass it to a summarization model (Hugging Face transformers) or an LLM backend." },
  { question: "how to login", answer: "Go to Login page, enter registered email & password. The demo uses a simple handler; wire up backend auth in production." },
  { question: "how to register", answer: "Go to Register page, fill name, email, phone, password, confirm password. The demo will call the onRegister handler." },
  { question: "what is otp flow", answer: "When sensitive actions occur (upload/retrieve), the backend sends a time-limited OTP to the user's email. The user must enter OTP to proceed." },
  { question: "how to logout", answer: "Click Logout in the header — that will clear session / navigate to login." },
  { question: "how to change password", answer: "Implement 'forgot password' flow where backend sends a reset link or OTP to email." },
  { question: "how to search docs", answer: "Use Retrieve tab — search by filename or keywords. Backend should index document text for searching." },
  { question: "api endpoints needed", answer: "Needed endpoints: /api/signup, /api/login, /api/upload, /api/list, /api/delete, /api/retrieve, /api/send-otp." },
  { question: "how to encrypt files", answer: "Use AES-256 with a user-supplied password or derived key to encrypt the file before storage. Store metadata only; never store plain password." },
  { question: "where to add s3 config", answer: "Backend (server) should hold S3 credentials (never place them in frontend). Use environment variables." },
  { question: "how is authentication handled", answer: "Implement JWT tokens on backend; frontend stores token in secure storage and sends Authorization header." },
  { question: "how to show uploaded files list", answer: "Backend provides a /list endpoint returning file metadata. Frontend renders that and allows delete/download." },
  { question: "what about activity logs", answer: "Backend logs actions to a DB table 'logs' with user, action, filename, timestamp. Admins view them." },
  { question: "how to add more q&a", answer: "Edit src/knowledgeBase.js and add objects of {question, answer}. ChatPage uses the array to answer queries." },
  { question: "where to place robot image", answer: "Place robot image in public/robot.png and reference it from the components or CSS (e.g., background-image:url('/robot.png'))." },
  { question: "how to change UI colors", answer: "Edit src/styles.css gradients and variables. The login/upload uses a blue→purple gradient." },
  { question: "how to prompt for password on upload", answer: "Frontend opens a modal before allowing file selection — the backend must accept a password parameter and use it to encrypt the uploaded file." },
  { question: "how to require password on retrieve", answer: "Retrieve flow should show a modal requesting password or OTP, then send it to backend to verify/decrypt." }
];

export default knowledgeBase;
