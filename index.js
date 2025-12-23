import express from "express";
import connectWithDataBase from './db/db.connections.js';
import cors from "cors";
import Lead from './models/lead.models.js';
import Comment from './models/comment.models.js';
import SalesAgent from './models/sales.models.js';
import Tag from './models/tag.models.js';


const app = express();

app.use(express.json());
app.use(cors());

connectWithDataBase();

// Sales Api
app.post("/agents", async (req, res) => {
    try {
        const createAgent = await SalesAgent.create(req.body);
        if (createAgent) {
            res.status(201).json(createAgent);
        } else {
            res.status(404).json({ error: "unable to create the agent" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to upload the agent data" });
    }
});

app.get("/agents", async (req, res) => {
    try {
        const getAgents = await SalesAgent.find();
        if (getAgents) {
            res.status(200).json(getAgents);
        } else {
            res.status(404).json({ error: "unable to get the agent" });
        }
    } catch (err) {
        res.status(500).json({ error: "failed to get the agent data" });
    }
});

async function createLead(newData) {
    try {
        const newLead = new Lead(newData);
        const savedNewLead = await newLead.save();
        return savedNewLead;
    } catch (error) {
        throw error;
    }
}

app.post("/leads", async (req, res) => {
    try {
        const saveLead = await createLead(req.body);
        if (saveLead) {
            const populatedLead = await Lead.findById(saveLead._id).populate("salesAgent", "name");
            res.status(201).json(populatedLead);
        } else {
            res.status(404).json({ error: "Unable to create new lead" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to create the lead" });
    }
});

async function getAllLeads() {
    try {
        const getAll = await Lead.find().populate("salesAgent", "name");
        return getAll;
    } catch (err) {
        throw err;
    }
}

app.get("/leads", async (req, res) => {
    try {
        const getLead = await getAllLeads();
        if (getLead) {
            res.status(200).json(getLead);
        } else {
            res.status(404).json({ error: "unable to get the lead data" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

async function getAllLeadById(id) {
    try {
        const getLeadById = await Lead.findById(id).populate("salesAgent", "name");
        return getLeadById;
    } catch (err) {
        throw err;
    }
}

app.get("/lead/:leadId", async (req, res) => {
    try {
        const iddata = await getAllLeadById(req.params.leadId);
        if (iddata) {
            res.status(200).json(iddata);
        } else {
            res.json(404).json({ error: "unable to get a particular id" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

app.get("/lead/status/get", async (req, res) => {
    try {
        const { status, salesAgent, priority, } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (salesAgent) filter.salesAgent = salesAgent;

        const leadByStatus = await Lead.find(filter).populate("salesAgent", "name");

        if (priority) {
            leadByStatus.sort((a, b) => {
                if (a.priority == priority && b.priority != priority) return -1;
                if (b.priority == priority && a.priority != priority) return 1;
                return 0;
            });
        }

        res.status(200).json(leadByStatus);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

async function updateLead(leadId, dataToUpdate) {
    try {
        if (dataToUpdate.status === "Closed") {
            dataToUpdate.closedAt = new Date();
        }
        const updatedData = await Lead.findByIdAndUpdate(leadId, dataToUpdate, { new: true });
        return updatedData;
    } catch (error) {
        throw error;
    }
}

app.post("/leads/:id", async (req, res) => {
    try {
        const update = await updateLead(req.params.id, req.body);
        if (update) {
            const populateLead = await Lead.findById(update._id).populate("salesAgent", "name");
            res.status(200).json(populateLead);
        } else {
            res.status(404).json({ error: "Lead with ID " + req.params.id + "not found." });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

async function deleteLead(leadid) {
    try {
        const deletedData = await Lead.findByIdAndDelete(leadid);
        return deletedData;
    } catch (error) {
        throw error;
    }
}

app.delete("/leads/:deleteId", async (req, res) => {
    try {
        const deleted = await deleteLead(req.params.deleteId);
        if (deleted) {
            res.status(200).json(deleted);
        } else {
            res.status(404).json({ error: "Lead with ID " + req.params.id + "not found." });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

// Comment Routes Creating 

async function addCommentToLead(idOfLead, commentData) {
    try {
        const addComment = new Comment({
            lead: idOfLead,
            ...commentData
        });
        const saveaddComment = await addComment.save();
        await saveaddComment.populate("author", "name");
        return saveaddComment;
    } catch (error) {
        throw error;
    }
}

app.post("/leads/:leadId/comments", async (req, res) => {
    try {
        const addedCom = await addCommentToLead(req.params.leadId, req.body);
        // console.log(req.body);
        if (addedCom) {
            res.status(201).json({
                id: addedCom._id,
                commentText: addedCom.commentText,
                author: addedCom.author.name,
                createdAt: addedCom.createdAt
            });
        } else {
            res.status(404).json({ error: "unable to add comment" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

async function getAllCommentLeads(leadIdAll) {
    try {
        const getAllComments = await Comment.find({ lead: leadIdAll }).populate("author", "name");
        return getAllComments;
    } catch (error) {
        throw error;
    }
}

app.get("/leads/:leadId/comments", async (req, res) => {
    try {
        const getAll = await getAllCommentLeads(req.params.leadId);
        if (getAll) {
            const formatted = getAll.map((comment) => ({
                id: comment._id,
                commentText: comment.commentText,
                author: comment.author?.name,
                createdAt: comment.createdAt
            }));
            res.status(200).json(formatted);
        } else {
            res.status(404).json({ error: "unable to get all the comments" });
        }
    } catch (error) {
        res.status(500).json({ error: "failed to fetch the data" });
    }
});

//  Creating Report API

app.get("/report/last-week", async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const getAllLeadSClosed = await Lead.find({
            status: "Closed",
            updatedAt: { $gte: sevenDaysAgo }
        }).populate("salesAgent", "name");
        if (getAllLeadSClosed) {
            res.status(200).json(getAllLeadSClosed);
        } else {
            res.status(404).json({ error: "unable to get the last week report data" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

app.get("/closed/salesagent", async (req, res) => {
    try {
        const leadClosedByAgent = await Lead.aggregate([
            {
                $match: { status: "Closed" }
            },
            {
                $group: {
                    _id: "$salesAgent",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "salesagents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent"
                }
            },
            {
                $unwind: "$agent"
            },
            {
                $project: {
                    _id: 0,
                    salesAgentName: "$agent.name",
                    closedLeadsCount: "$count"
                }
            },
            {
                $sort: { closedLeadsCount: -1 }
            }
        ]);

        res.status(200).json(leadClosedByAgent);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the data " });
    }
});

app.get("/report/pipeline", async (req, res) => {
    try {
        const getLeadsInPieline = await Lead.countDocuments({
            status: { $ne: "Closed" }
        });
        res.status(200).json({ getLeadsInPieline });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});

app.get("/report/leadDistribution", async (req, res) => {
    try {
        const geteachLeadByStatusDistribution = await Lead.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            },
            {
                $sort: { status: 1 }
            }
        ]);
        res.status(200).json(geteachLeadByStatusDistribution);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the data" });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Successfully connected to Mongodb ${PORT}`);
});