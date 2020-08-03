// Generate the random reset token
const verificationToken = user.createPasswordResetToken();
await user.save({ validateBeforeSave: false });
// Send email
const verificationURL = `${req.protocol}://${req.get(
  "host"
)}/api/v1/users/verifypassword/${verificationToken}`;
const message = `<h1>Follow the link to activate your guest account</h1>
                  <a>${verificationURL}</a>`;

  await sendEmail({
    email: user.email,
    subject: "Activate your account",
    html: message,
  });