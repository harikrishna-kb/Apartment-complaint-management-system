// Dedicated REST Test API bridge handler
// Compatible with both Vite connect middleware and standalone Node HTTP server

const BASELINE_USERS = [
  {
    id: 'admin_user_001',
    uid: 'admin_user_001',
    email: 'admin@society.com',
    password: 'password123',
    name: 'Society Secretary (Admin)',
    role: 'admin',
  },
  {
    id: 'tech_user_001',
    uid: 'tech_user_001',
    email: 'ramesh@tech.com',
    password: 'password123',
    name: 'Ramesh Sharma',
    role: 'technician',
    specialty: 'Lead Electrician',
  },
  {
    id: 'tech_user_002',
    uid: 'tech_user_002',
    email: 'suresh@tech.com',
    password: 'password123',
    name: 'Suresh Nair',
    role: 'technician',
    specialty: 'Senior Plumber',
  },
  {
    id: 'res_user_rohit',
    uid: 'res_user_rohit',
    email: 'rohit@society.com',
    password: 'password123',
    name: 'Rohit',
    role: 'resident',
    flat_no: 'A-104',
  },
];

function getInitialComplaints() {
  return [
    {
      id: 'complaint_baseline_01',
      ticketId: 'CMS-1001',
      tokenNumber: 'TKN-100101',
      title: 'Main water line valve leakage',
      description: 'Kitchen shutoff valve leaking under continuous pressure.',
      category: 'Plumbing',
      priority: 'P1 - Critical',
      status: 'Pending',
      slaHours: 4,
      resident: { id: 'res_user_rohit', name: 'Rohit', flatNo: 'A-104' },
      location: { tower: 'Tower A', flatNo: 'A-104' },
      technician: { id: null, name: null },
      technician_id: null,
      technician_name: null,
      costEstimate: '₹350 (Parts)',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      resolvedAt: null,
    },
    {
      id: 'complaint_baseline_02',
      ticketId: 'CMS-1002',
      tokenNumber: 'TKN-100202',
      title: 'Circuit breaker tripping on corridor light',
      description: 'MCB switches off when hallway halogen lamps turned on.',
      category: 'Electrical',
      priority: 'P2 - High',
      status: 'Assigned',
      slaHours: 12,
      resident: { id: 'res_user_rohit', name: 'Rohit', flatNo: 'A-104' },
      location: { tower: 'Tower A', flatNo: 'A-104' },
      technician: { id: 'tech_user_001', name: 'Ramesh Sharma' },
      technician_id: 'tech_user_001',
      technician_name: 'Ramesh Sharma',
      costEstimate: '₹250 (Parts)',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      resolvedAt: null,
    },
    {
      id: 'complaint_baseline_03',
      ticketId: 'CMS-1003',
      tokenNumber: 'TKN-100303',
      title: 'Balcony drainage blockage cleared',
      description: 'Leaves removed from stormwater floor trap.',
      category: 'Plumbing',
      priority: 'P3 - Moderate',
      status: 'Resolved',
      slaHours: 24,
      resident: { id: 'res_user_rohit', name: 'Rohit', flatNo: 'A-104' },
      location: { tower: 'Tower A', flatNo: 'A-104' },
      technician: { id: 'tech_user_002', name: 'Suresh Nair' },
      technician_id: 'tech_user_002',
      technician_name: 'Suresh Nair',
      costEstimate: 'Society Covered',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      resolvedAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ];
}

// In-memory data store for testing sessions
let state = {
  users: [...BASELINE_USERS],
  complaints: getInitialComplaints(),
};

export function resetState() {
  state.users = [...BASELINE_USERS];
  state.complaints = getInitialComplaints();
  return {
    usersCount: state.users.length,
    complaintsCount: state.complaints.length,
    complaints: state.complaints,
  };
}

export function getState() {
  return state;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return true;
  }

  // 1. POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const { email, password } = body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = state.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      sendJson(res, 401, {
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
      });
      return true;
    }

    sendJson(res, 200, {
      success: true,
      token: `jwt_test_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    return true;
  }

  // 2. GET /api/staff
  if (method === 'GET' && pathname === '/api/staff') {
    const techs = state.users
      .filter((u) => u.role === 'technician')
      .map((t) => ({
        id: t.id,
        uid: t.uid,
        name: t.name,
        email: t.email,
        specialty: t.specialty || 'General Maintenance',
      }));
    sendJson(res, 200, {
      success: true,
      data: techs,
      count: techs.length,
    });
    return true;
  }

  // 3. GET /api/complaints (with query params: ?status=...&category=...)
  if (method === 'GET' && pathname === '/api/complaints') {
    const statusQuery = urlObj.searchParams.get('status');
    const categoryQuery = urlObj.searchParams.get('category');

    let result = [...state.complaints];

    if (statusQuery && statusQuery !== 'ALL') {
      result = result.filter(
        (c) => (c.status || '').toLowerCase() === statusQuery.toLowerCase()
      );
    }

    if (categoryQuery && categoryQuery !== 'ALL') {
      result = result.filter(
        (c) => (c.category || '').toLowerCase() === categoryQuery.toLowerCase()
      );
    }

    sendJson(res, 200, {
      success: true,
      count: result.length,
      data: result,
    });
    return true;
  }

  // 4. POST /api/complaints
  if (method === 'POST' && pathname === '/api/complaints') {
    const body = await parseBody(req);
    const { title, description, category, priority, flatNo } = body;

    if (!title || !title.trim() || !description || !description.trim()) {
      sendJson(res, 400, {
        success: false,
        error: 'Validation failed: Both "title" and "description" are required.',
      });
      return true;
    }

    const tokenNumber = `TKN-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketIndex = state.complaints.length + 1045;
    const ticketId = `CMS-${ticketIndex}`;
    const newId = `complaint_${Date.now()}`;

    const newTicket = {
      id: newId,
      ticketId,
      tokenNumber,
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      priority: priority || 'P3 - Moderate',
      status: 'Pending',
      slaHours: priority && priority.includes('P1') ? 4 : 24,
      resident: {
        id: 'res_user_rohit',
        name: 'Rohit',
        flatNo: flatNo || 'A-104',
      },
      location: {
        tower: flatNo?.startsWith('B') ? 'Tower B' : 'Tower A',
        flatNo: flatNo || 'A-104',
      },
      technician: { id: null, name: null },
      technician_id: null,
      technician_name: null,
      costEstimate: 'Society Covered',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    state.complaints.unshift(newTicket);

    sendJson(res, 201, {
      success: true,
      message: 'Complaint submitted successfully',
      data: newTicket,
    });
    return true;
  }

  // 5. PATCH /api/complaints/:id/assign
  const assignMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/assign$/);
  if (method === 'PATCH' && assignMatch) {
    const complaintId = assignMatch[1];
    const body = await parseBody(req);
    const { technicianId, technicianName } = body;

    const ticket = state.complaints.find(
      (c) => c.id === complaintId || c.ticketId === complaintId
    );

    if (!ticket) {
      sendJson(res, 404, {
        success: false,
        error: `Complaint with ID "${complaintId}" not found`,
      });
      return true;
    }

    ticket.status = 'Assigned';
    ticket.technician_id = technicianId || 'tech_user_001';
    ticket.technician_name = technicianName || 'Ramesh Sharma';
    ticket.technician = {
      id: ticket.technician_id,
      name: ticket.technician_name,
      assignedAt: new Date().toISOString(),
    };

    sendJson(res, 200, {
      success: true,
      message: 'Technician assigned successfully',
      data: ticket,
    });
    return true;
  }

  // 6. PATCH /api/complaints/:id/resolve
  const resolveMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/resolve$/);
  if (method === 'PATCH' && resolveMatch) {
    const complaintId = resolveMatch[1];

    const ticket = state.complaints.find(
      (c) => c.id === complaintId || c.ticketId === complaintId
    );

    if (!ticket) {
      sendJson(res, 404, {
        success: false,
        error: `Complaint with ID "${complaintId}" not found`,
      });
      return true;
    }

    ticket.status = 'Resolved';
    ticket.resolvedAt = new Date().toISOString();

    sendJson(res, 200, {
      success: true,
      message: 'Complaint resolved successfully',
      data: ticket,
    });
    return true;
  }

  // 7. POST & GET /api/test/reset
  if ((method === 'POST' || method === 'GET') && pathname === '/api/test/reset') {
    const baseline = resetState();
    sendJson(res, 200, {
      success: true,
      message: 'Test environment reset to baseline successfully.',
      baseline: {
        users: baseline.usersCount,
        complaints: baseline.complaintsCount,
        seedTickets: baseline.complaints.map((c) => ({
          id: c.id,
          ticketId: c.ticketId,
          status: c.status,
          title: c.title,
        })),
      },
    });
    return true;
  }

  return false;
}
