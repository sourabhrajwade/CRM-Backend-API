const Leads = require("../models/lead");
const Contacts = require("../models/contact");

// Search in contact to get lead,remove duplicated leads
exports.createLead = async (req, res, next) => {
  try {
    const { fullname, email, department,updatedDate, mobile, description, companyname, city, gender, status, priority, source,assignedTo } = req.body;
    const newLead = await Leads.create({
      fullname,
      city,
      email,
      mobile,
      description,
      companyname,
      updatedDate,
      gender,
      department,
      status,
      priority,
      source,
      assignedTo
    });
    const lead = await Leads.findOne({ email: newLead.email });
    if (!lead) {
      res.status(500).json({
        message: "Lead does not exist",
      });
    }
    else {
      res.status(200).json({
        message: "Lead successfully created."
      })
  }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error in Lead creation.",
    });
  }
};

exports.viewLead = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const lead = await Leads.findOne({ _id: leadId });
    res.status(200).json({
      message: "Leads info",
      lead,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.fetchAll = async (req, res, next) => {
  const leads = await Leads.find({delete: false});
  res.status(200).json({
    message: "List of leads",
    leads,
  });
};

exports.updateLead = async (req, res, next) => {
  try {
    const email = req.body.email;
    
    const lead = await Leads.findOne({ email });
    if (!lead) {
      res.status(400).json({
        message: "Lead doesn't exist.",
      });
    }
    const priority = req.body.priority;
    const source = req.body.source; 
    const description = req.body.description;
    const updatedDate = Date.now();
    const status = req.body.status;
    const updatedLead = await Leads.updateMany(
      { email },
      { $set: { description, updatedDate, status, source,  priority} }
    );
    console.log(updatedLead);
    if (updatedLead.nModified != 0) {
      res.status(200).json({
        message: "Updated",
        updatedLead,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error in updating leads",
    });
  }
};
// Soft delete lead
exports.deleteLead = async (req, res, next) => {
  const leadId = req.body.id;
  const lead = await Leads.findOne({ _id: leadId });
  if (!lead) {
    res.status(400).json({
      message: "Lead doesn't exist.",
    });
  }
  const deleteLead = await Leads.updateOne(
    { _id: leadId },
    { $set: { delete: true } }
  );
  if (deleteLead.nModified > 0) {
    res.status(200).json({
      message: "Leads were deleted and sent for complete deletion",
      deleteLead,
    });
  }
};

// Permanent delete - Manager and Admin rights required
exports.remove = async (req, res, next) => {
  const leadId = req.params.id;
  const lead = await Leads.findOne({ _id: leadId, delete: true});
  console.log(lead);
  if (!lead) {
    res.status(400).json({
      message: "Bad request, Lead is not deleted.",
    });
  } else {
    const deleteLead = await Leads.deleteOne({ _id: leadId });
    if (deleteLead.deleteCount > 0) {
      res.status(200).json({
        message: "Permannetly deleted",
      });
    }
  }
};
// View Shallow deleted Leads
exports.viewDelete = async (req,res,next) => {
    try {
        const deletedLeads = await Leads.find({delete: true});
        if (!deletedLeads) {
            res.status(400).json({
                message: "Error"
            })
        } else {
            res.status(200).json({
                message: "List deleted",
                deletedLeads
            })
        }
    } catch (error) {
        console.log(error);
    }
};
// Restore Lead - Admin/Manager
exports.restore = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const lead = await Leads.findOne({ _id: leadId, delete: true });
    if (!lead) {
      res.status(400).json({
        message: "Bad request, Lead does not exits",
      });
    }
    const updatedLead = await Leads.updateOne(
      { _id: leadId, delete: true },
      { $set: { delete: false } }
    );
    if (updatedLead.nModified != 0) {
      res.status(200).json({
        message: "Updated",
        updatedLead,
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error occured!", 
      err,
    });
  }
};
