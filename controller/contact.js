
const Contact = require("../models/contact");

const Response = (res, code, message) => {
  return res.status(code).json({
    message,
  });
};

exports.createContact = async (req, res, next) => {
  try {
    let contactId = 1;
    const { email, name, phone, description } = req.body;
    const newContact = await new Contact({
      id: contactId,
      name,
      email,
      phone,
      description,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    const contact = await Contact.findOne({
      email: newContact.email,
      phone: newContact.phone,
    });
    if (!contact) {
      return Response(res, 500, "User not found, Register again");
    }
    await contact.save({ validateBeforeSave: false });
    contactId++;
    return await Response(res, 200, "Contact successfully created.");

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error occured during contact creation",
    });
  }
};

