// Sample employee data
const employees = [
  {
    type: "Employee",
    attributes: {
      id: {
        label: "ID",
        value: 32505098,
        type: "integer",
        universal_id: "id",
      },
      first_name: {
        label: "First name",
        value: "Joshua",
        type: "standard",
        universal_id: "first_name",
      },
      last_name: {
        label: "Last name",
        value: "Rhodes",
        type: "standard",
        universal_id: "last_name",
      },
    },
  },
  {
    type: "Employee",
    attributes: {
      id: {
        label: "ID",
        value: 32505100,
        type: "integer",
        universal_id: "id",
      },
      first_name: {
        label: "First name",
        value: "Emma",
        type: "standard",
        universal_id: "first_name",
      },
      last_name: {
        label: "Last name",
        value: "Johnson",
        type: "standard",
        universal_id: "last_name",
      },
    },
  },
];

// Controller function
const getEmployees = (req, res) => {
  const { attributes, limit } = req.query;

  let data = employees;

  // Limit results
  if (limit) {
    data = data.slice(0, parseInt(limit));
  }

  // Filter attributes if provided
  if (attributes) {
    const attrs = Array.isArray(attributes) ? attributes : [attributes];
    data = data.map((emp) => {
      let filtered = {};
      attrs.forEach((attr) => {
        if (emp.attributes[attr]) {
          filtered[attr] = emp.attributes[attr];
        }
      });
      return {
        type: emp.type,
        attributes: filtered,
      };
    });
  }

  res.json({
    success: true,
    data,
  });
};

module.exports = { getEmployees };
