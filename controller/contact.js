const Contacts = require("../models/contact");

const responseFun = (res, code, message) => {
  return res.status(code).json({
    message,
  });
};

exports.createContact = async (req, res, next) => {
  try {
    let contactId = 1;
    const newContact = await Contacts.create({
      id: contactId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      description: req.body.description,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    const contact = await Contacts.findOne({
      email: newContact.email,
    });
    if (!contact) {
      return responseFun(res, 500, "User not found, Register again");
    }
    await contact
      .save()
      .then(contactId++)
      .then(
        res.status(200).json({
          message: "Contact successfully created.",
        })
      );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error occured during contact creation",
      err,
    });
  }
};

exports.getContactbyEmail = async (req, res, next) => {
  const contactEmail = req.body.email;

  const contact = await Contacts.findOne({email: contactEmail});
  if (!contact) {
    return responseFun(res, 500, 'Contact does not exit');
  }
  res.status(200).json({
    message: "Contact found",
    contact
  })
};

exports.getAllContacts = async (req, res, next) => {
  const contacts = await Contacts.find();

  res.status(200).json({
    message: "List of contacts",
    contacts
  })
};
// Update contact 



// Filter contact


// Delete Contact
