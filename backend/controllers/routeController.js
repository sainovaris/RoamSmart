const { getOptimizedRoute } = require("../services/directionsService");

exports.getRoute = async (req, res) => {
  try {
    const { origin, places } = req.body;
    

    if (!origin || !places || places.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Origin and places are required",
      });
    }

    const result = await getOptimizedRoute(origin, places);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Route Controller Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get route",
    });
  }
};