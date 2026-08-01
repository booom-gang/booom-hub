const MOCK_USERS = [
  {
    _id: 'u1',
    username: 'Alex',
    profile_picture: null,
    about: 'Into hiking and photography. Always down for a road trip.',
    joined_at: '2025-01-15T10:00:00Z',
  },
  {
    _id: 'u2',
    username: 'Jordan',
    profile_picture: null,
    about: 'Coffee enthusiast and amateur chef.',
    joined_at: '2025-02-20T14:30:00Z',
  },
  {
    _id: 'u3',
    username: 'Sam',
    profile_picture: null,
    about: 'Bookworm. Currently reading way too many fantasy novels.',
    joined_at: '2025-03-10T09:15:00Z',
  },
  {
    _id: 'u4',
    username: 'Riley',
    profile_picture: null,
    about: 'Music lover. Playing guitar since I was 12.',
    joined_at: '2025-04-05T16:45:00Z',
  },
  {
    _id: 'u5',
    username: 'Casey',
    profile_picture: null,
    about: 'Gamer and tech nerd. Ask me about mechanical keyboards.',
    joined_at: '2025-05-01T11:00:00Z',
  },
];

let MOCK_GALLERY = [
  {
    _id: 'g1',
    user_id: MOCK_USERS[0],
    media_type: 'image',
    file_key: 'gallery-image/u1/mock-1.jpg',
    thumbnail_key: null,
    file_size_bytes: 245000,
    created_at: '2025-07-20T15:30:00Z',
    proxy_url: 'https://picsum.photos/seed/group1/400/400',
    thumbnail_proxy_url: null,
  },
  {
    _id: 'g2',
    user_id: MOCK_USERS[1],
    media_type: 'image',
    file_key: 'gallery-image/u2/mock-2.jpg',
    thumbnail_key: null,
    file_size_bytes: 312000,
    created_at: '2025-07-19T10:00:00Z',
    proxy_url: 'https://picsum.photos/seed/group2/400/400',
    thumbnail_proxy_url: null,
  },
  {
    _id: 'g3',
    user_id: MOCK_USERS[2],
    media_type: 'video',
    file_key: 'gallery-video/u3/mock-3.mp4',
    thumbnail_key: 'gallery-video-thumb/u3/mock-3-thumb.jpg',
    file_size_bytes: 15400000,
    created_at: '2025-07-18T20:15:00Z',
    proxy_url: '',
    thumbnail_proxy_url: 'https://picsum.photos/seed/group3/400/400',
  },
  {
    _id: 'g4',
    user_id: MOCK_USERS[3],
    media_type: 'image',
    file_key: 'gallery-image/u4/mock-4.jpg',
    thumbnail_key: null,
    file_size_bytes: 198000,
    created_at: '2025-07-17T12:45:00Z',
    proxy_url: 'https://picsum.photos/seed/group4/400/400',
    thumbnail_proxy_url: null,
  },
  {
    _id: 'g5',
    user_id: MOCK_USERS[4],
    media_type: 'image',
    file_key: 'gallery-image/u5/mock-5.jpg',
    thumbnail_key: null,
    file_size_bytes: 275000,
    created_at: '2025-07-16T08:20:00Z',
    proxy_url: 'https://picsum.photos/seed/group5/400/400',
    thumbnail_proxy_url: null,
  },
  {
    _id: 'g6',
    user_id: MOCK_USERS[0],
    media_type: 'image',
    file_key: 'gallery-image/u1/mock-6.jpg',
    thumbnail_key: null,
    file_size_bytes: 410000,
    created_at: '2025-07-15T18:00:00Z',
    proxy_url: 'https://picsum.photos/seed/group6/400/400',
    thumbnail_proxy_url: null,
  },
];

let MOCK_MESSAGES = [
  {
    _id: 'm1',
    user_id: 'u1',
    sender_name: 'Alex',
    message_text: 'Hey everyone! Anyone up for a hike this weekend?',
    timestamp: '2025-07-30T14:00:00Z',
  },
  {
    _id: 'm2',
    user_id: 'u2',
    sender_name: 'Jordan',
    message_text: "I'm in! Where are we thinking?",
    timestamp: '2025-07-30T14:02:00Z',
  },
  {
    _id: 'm3',
    user_id: 'u1',
    sender_name: 'Alex',
    message_text: 'There is that new trail at Eagle Rock. About 4 miles round trip.',
    timestamp: '2025-07-30T14:03:00Z',
  },
  {
    _id: 'm4',
    user_id: 'u3',
    sender_name: 'Sam',
    message_text: 'Sounds perfect. I will bring snacks!',
    timestamp: '2025-07-30T14:05:00Z',
  },
  {
    _id: 'm5',
    user_id: 'u4',
    sender_name: 'Riley',
    message_text: 'Count me in too. What time should we meet?',
    timestamp: '2025-07-30T14:10:00Z',
  },
  {
    _id: 'm6',
    user_id: 'u1',
    sender_name: 'Alex',
    message_text: 'How about 9am at the trailhead parking lot?',
    timestamp: '2025-07-30T14:12:00Z',
  },
  {
    _id: 'm7',
    user_id: 'u5',
    sender_name: 'Casey',
    message_text: "I'll be there! Do we need to bring anything specific?",
    timestamp: '2025-07-30T14:15:00Z',
  },
  {
    _id: 'm8',
    user_id: 'u2',
    sender_name: 'Jordan',
    message_text: 'Just water and good shoes. The trail is mostly shaded.',
    timestamp: '2025-07-30T14:18:00Z',
  },
];

let MOCK_EVENTS = [
  {
    _id: 'e1',
    title: 'Group Hike at Eagle Rock',
    description: 'Meet at the trailhead parking lot. Bring water and snacks.',
    date: '2025-08-02T09:00:00Z',
    created_by: MOCK_USERS[0],
    created_at: '2025-07-28T10:00:00Z',
  },
  {
    _id: 'e2',
    title: 'Game Night',
    description: "Bring your favorite board game. Pizza provided.",
    date: '2025-08-08T19:00:00Z',
    created_by: MOCK_USERS[4],
    created_at: '2025-07-25T15:30:00Z',
  },
  {
    _id: 'e3',
    title: 'Movie Marathon',
    description: 'Going through the entire Lord of the Rings trilogy.',
    date: '2025-08-15T18:00:00Z',
    created_by: MOCK_USERS[2],
    created_at: '2025-07-26T09:00:00Z',
  },
  {
    _id: 'e4',
    title: 'BBQ at the Park',
    description: 'Everyone bring something to grill. I will handle sides.',
    date: '2025-08-22T12:00:00Z',
    created_by: MOCK_USERS[1],
    created_at: '2025-07-27T11:00:00Z',
  },
];

let nextId = 100;

export const mockAuth = {
  currentUser: null,
  login(masterPassword, username) {
    if (masterPassword !== 'password') {
      throw { response: { data: { error: 'Invalid password' } } };
    }
    let user = MOCK_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      user = {
        _id: 'u' + Date.now(),
        username,
        profile_picture: null,
        about: '',
        joined_at: new Date().toISOString(),
      };
      MOCK_USERS.push(user);
    }
    this.currentUser = user;
    return { token: 'mock-jwt-token', user };
  },
  getMe() {
    if (!this.currentUser) throw { response: { status: 401 } };
    return this.currentUser;
  },
};

export const mockUsers = {
  getAll() {
    return [...MOCK_USERS];
  },
  updateMe(updates) {
    const idx = MOCK_USERS.findIndex((u) => u._id === this.currentUser._id);
    if (idx !== -1) {
      MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...updates };
      this.currentUser = MOCK_USERS[idx];
    }
    return { ...this.currentUser };
  },
};

export const mockGallery = {
  getAll(page = 1, limit = 24) {
    const sorted = [...MOCK_GALLERY].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);
    return { items, page, limit, total: MOCK_GALLERY.length, totalPages: Math.ceil(MOCK_GALLERY.length / limit) };
  },
  create(item) {
    const user = MOCK_USERS.find((u) => u._id === item.user_id) || MOCK_USERS[0];
    const newItem = {
      _id: 'g' + nextId++,
      user_id: user,
      media_type: item.media_type,
      file_key: item.file_key,
      thumbnail_key: item.thumbnail_key || null,
      file_size_bytes: item.file_size_bytes,
      created_at: new Date().toISOString(),
      proxy_url: `https://picsum.photos/seed/mock${nextId}/400/400`,
      thumbnail_proxy_url: item.thumbnail_key
        ? `https://picsum.photos/seed/mock${nextId}t/400/400`
        : null,
    };
    MOCK_GALLERY.unshift(newItem);
    return newItem;
  },
  remove(id) {
    MOCK_GALLERY = MOCK_GALLERY.filter((item) => item._id !== id);
  },
};

export const mockMessages_svc = {
  getAll(before, limit = 50) {
    let msgs = [...MOCK_MESSAGES];
    if (before) {
      msgs = msgs.filter((m) => new Date(m.timestamp) < new Date(before));
    }
    return msgs.slice(-limit);
  },
  add(text) {
    const user = mockAuth.currentUser || MOCK_USERS[0];
    const msg = {
      _id: 'm' + nextId++,
      user_id: user._id,
      sender_name: user.username,
      message_text: text,
      timestamp: new Date().toISOString(),
    };
    MOCK_MESSAGES.push(msg);
    return msg;
  },
};

export const mockEvents = {
  getAll(month, year) {
    return MOCK_EVENTS.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  create(data) {
    const user = mockAuth.currentUser || MOCK_USERS[0];
    const event = {
      _id: 'e' + nextId++,
      title: data.title,
      description: data.description || '',
      date: data.date,
      created_by: user,
      created_at: new Date().toISOString(),
    };
    MOCK_EVENTS.push(event);
    return event;
  },
  update(id, data) {
    const idx = MOCK_EVENTS.findIndex((e) => e._id === id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...data };
      return MOCK_EVENTS[idx];
    }
    throw { response: { data: { error: 'Event not found' } } };
  },
  remove(id) {
    MOCK_EVENTS = MOCK_EVENTS.filter((e) => e._id !== id);
  },
};
