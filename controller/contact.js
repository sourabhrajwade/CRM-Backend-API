const Contacts = require("../models/contact");

const responseFun = (res, code, message) => {
  return res.status(code).json({
    message,
  });
};

exports.createContact = async (req, res, next) => {
  try {
    const { email, name, phone, description } = req.body;
    const newContact = await Contacts.create({
      name,
      email,
      phone,
      description,
    });
    const findCont = Contacts.findOne({ email });
    if (!findCont) {
      res.status(500).json({
        message: "Error in creation",
        findCont,
      });
    } else {
      res.status(200).json({
        message: "Contact Created",
      });
    }
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

  const contact = await Contacts.findOne({ email: contactEmail });
  if (!contact) {
    return responseFun(res, 500, "Contact does not exit");
  }
  res.status(200).json({
    message: "Contact found",
    contact,
  });
};

exports.getAllContacts = async (req, res, next) => {
  const contacts = await Contacts.find();

  res.status(200).json({
    message: "List of contacts",
    contacts,
  });
};
// Update contact
exports.updateContact = async (req, res, next) => {
  try {
    const contactId = req.body._id;
    const email = req.body.email;
    const phone = req.body.phone;
    const description = req.body.description;
    const updateContact = await Contacts.findOneAndUpdate(
      { _id: contactId },
       { email, phone, description }, {
        new: true,
        upsert: true,
       }
    );
    if (updateContact.nModified = 0) {
      res.status(500).json({
        message: "Error in updation of contact",
      });
      
    } else {
      res.status(200).json({
        message: "Contact updated",
        updateContact,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error occured",
      err,
    });
  }
};
// Filter contact

// Delete Contact
exports.delete = async (req, res, next) => {
  try {
    const contactId = req.params.id;
    const contact = await Contacts.deleteOne({ _id: contactId });
    console.log((await contact).deletedCount);
    if (contact.deletedCount > 0) {
      res.status(200).json({
        message: "Contact deleted",
      });
    } else {
      res.status(500).json({
        message: "Error in contact deletion ",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error in deletion",
      err,
    });
  }
};
