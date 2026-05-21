import Community from '../models/Community.js';

export async function createCommunity(req, res) {
  const community = await Community.create({ ...req.body, createdBy: req.user._id, admins: [req.user._id], members: [req.user._id] });
  res.status(201).json(community);
}

export async function getCommunities(req, res) {
  const communities = await Community.find().populate('createdBy', 'name hometown').sort('-createdAt');
  res.json(communities);
}

export async function getCommunityById(req, res) {
  const community = await Community.findById(req.params.id).populate('members', 'name hometown');
  if (!community) return res.status(404).json({ message: 'Community not found' });
  res.json(community);
}

export async function joinCommunity(req, res) {
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ message: 'Community not found' });
  if (!community.members.includes(req.user._id)) community.members.push(req.user._id);
  await community.save();
  res.json(community);
}
