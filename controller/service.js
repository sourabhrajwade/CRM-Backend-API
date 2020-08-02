const Services = require("../models/service");

exports.createRequest = async (req, res, next) => {
  try {
    const { title, categories, description, assignmed_to, status } = req.body;
    const request = await Services.create({
      title,
      categories,
      description,
      assignmed_to,
      status,
    });
    if (!request) {
      res.status(500).json({
        message: "Request not found",
      });
    } else {
      res.status(200).json({
        message: "service request created",
        request,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error in service request creation ",
    });
  }
};
exports.selectService = async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const service = await Services.findOne({ _id: serviceId });
    if (!service) {
      res.status(400).json({
        message: "service doesn't exist.",
      });
    } else {
      res.status(200).json({
        message: "service found",
        service,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error in service request selection ",
    });
  };

  // Patch request
  exports.updateStatus = async (req, res, next) => {
    try {
      const serviceId = req.params.id
      const service = await Services.findOne({ _id: serviceId });
      if (!service) {
        res.status(400).json({
          message: "service doesn't exist.",
        });
      }
      const description = req.body.description;
      const updated_on = Date.now();
      const status = req.body.status;
      const updatedService = await Service.updateOne(
        { _id: serviceId },
        { $set: { description, updated_on, status} }
      );
      if ((await updatedService).nModified != 0 ) {
        res.status(200).json({
          message: "Updated",
          updatedService,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error in contact updation",
        err
      })
    }
  };
};
