//IMPORT
const express = require("express");
const axios = require("axios");
const { validateUser } = require("../middlewares/userMiddleware");
const { validateSubscribe } = require("../middlewares/subscribtionMiddleware");

const router = express.Router();

const BASE_URL_ZR = "https://procolis.com/api_v1";
const BASE_URL_YALIDINE = "https://api.yalidine.app/v1";

//route1 (Test API Key Zr-Express)
router.post(
  "/zr/test-token",
  validateUser,
  validateSubscribe,
  async (req, res) => {
    const { token, key } = req.body;
    try {
      const response = await axios.get(`${BASE_URL_ZR}/token`, {
        headers: {
          token: token,
          key: key,
        },
      });
      if (response.data.Statut == "Accès activé") {
        return res.status(200).json({ key: "Key and Token Detected" });
      }
      return res.status(404).json({ noKey: "Invalid API key or token" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

//route2 (Test API Key Yalidine)
router.post(
  "/yalidine/test-token",
  validateUser,
  validateSubscribe,
  async (req, res) => {
    const { token, key } = req.body;
    try {
      const response = await axios.get(`${BASE_URL_YALIDINE}/wilayas`, {
        headers: {
          "X-API-ID": key,
          "X-API-TOKEN": token,
        },
      });
      if (response.data?.data) {
        return res.status(200).json({ key: "Key and Token Detected" });
      }
      return res.status(404).json({ noKey: "No API-key/token" });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return res
            .status(404)
            .json({ error: "Error: Invalid API key or token" });
        }
        return res
          .status(error.response.status)
          .json({ error: error.response.data });
      }
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
);

//route3 (Add Package (zr))
router.post(
  "/zr/add-colis",
  validateUser,
  validateSubscribe,
  async (req, res) => {
    const { token, key, Colis } = req.body;
    try {
      const response = await axios.post(
        `${BASE_URL_ZR}/add_colis`,
        { Colis: Colis },
        {
          headers: {
            token: token,
            key: key,
          },
        }
      );
      if (response.data.COUNT !== 0) {
        return res.status(200).json({ added: "Packages added" });
      }
      return res
        .status(500)
        .json({ notAdded: "Packages addition Failed, Check your infos" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

//route4 (Add Package (Yalidine))
router.post(
  "/yalidine/add-colis",
  validateUser,
  validateSubscribe,
  async (req, res) => {
    const { token, key, Colis } = req.body;
    try {
      const response = await axios.post(
        `${BASE_URL_YALIDINE}/add_colis`,
        { Colis },
        {
          headers: {
            "X-API-ID": key,
            "X-API-TOKEN": token,
          },
        }
      );
      const orders = Object.values(response.data);
      const allSuccess = orders.every((order) => order.success);
      if (allSuccess) {
        return res.status(200).json({ added: "Packages added" });
      } else {
        return res
          .status(400)
          .json({ notAdded: "Packages addition Failed, Check your infos" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
