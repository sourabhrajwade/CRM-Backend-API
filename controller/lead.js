const Leads = require("../models/lead");
const Contacts = require("../models/contact");
const Lead = require("../models/lead");
// Search in contact to get lead,remove duplicated leads 
exports.createLead = async (req, res, next) => {
try {
  const { data } = req.body;
  const leadEmail = req.body.email;
  const newLead = await Leads.create({
    ...data,
  });
  const lead = await Leads.findOne({email: newLead.email});
  if (!lead) {
      res.status(500).json({
          message: "Lead does not exist"
      })
  }
  lead.save()
  .then(
    res.status(200).json({
      message: "Lead successfully created.",
    })
  );}
  catch(err) {
      console.log(err);
      res.status(400).json({
          message: "Error in Lead creation."
      })
  }
};

exports.viewLead = async (req, res, next) => {
    try {
        const leadId = req.params.id;
        const lead = await Lead.findOne({_id:leadId});
        res.status(200).json({
            message: "Leads info",
            lead
        });
    } catch(err) {
        console.log(err);
    }
};

exports.fetchAll = async (req, res, next) => {
    const leads = await Lead.find();
    res.status(200).json({
        message: "List of leads",
        leads
    })
};

exports.updateLead = async (req, res, next) => {
    try {
    const leadId = req.params.id;
    const lead = await Lead.findOne({_id: leadId});
    if (!lead) {
        res.status(400).json({
            message: "Lead doesn't exist.",
        });
    }
    lead.description = req.body.description;
    lead.updatedDate = req.body.updatedDate;
    lead.status = req.body.status;
    await lead.save()
    .then(
        res.status(200).json({
            message: "Lead updated",
            lead
        }))
    } catch(err) {
        res.status(400).json({
            message: "Error in updating leads"
        })
    }
};
// Soft delete lead
exports.deleteLead = async (req, res, next) => {
    const leadId = req.params.id;
    const lead = await Lead.findOne({_id: leadId});
    if (!lead) {
        res.status(400).json({
            message: "Lead doesn't exist.",
        });
    };
    lead.delete = true;
    await lead.save()
    .then(
        res.status(200).json({
            message: "Soft deleted lead, for hard delete get from admin"
        })
    )

};

// Restore Lead - Admin/Manager
