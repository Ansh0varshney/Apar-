const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
const port = 8000;
const upload = multer({ dest: 'uploads/' }); // Uploads will be stored in the 'uploads' directory
// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Atlas connection URI
const uri = "mongodb+srv://anshv0606:rn5jUr2aPjSudUUK@clusterapar.asemiel.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAPAR";

// Connect to MongoDB Atlas
mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// Schemas and Models
const conductorSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    customerName: { type: String, required: false },
    size: { type: String, required: true },
    conductorType: { type: String, required: false },
    drumNumber: { type: String, required: true },
    balanceLength: { type: Number, required: true },
    cableType: { type: String, required: false },
    cutLength: { type: String, required: false },
    remarks: { type: String, required: false},
    hasBeenUpdated: { type: Boolean, default: false }
});
app.delete('/conductors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Conductor.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.status(200).send('Entry deleted successfully');
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error deleting conductor entry:', error);
        res.status(500).send('Error deleting entry');
    }
});app.patch('/conductors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        
        // If remarks is set to "OK", prevent further updates
        if (update.remarks && update.remarks.toLowerCase() === 'ok') {
            update.hasBeenUpdated = true;
        }

        const result = await Conductor.findByIdAndUpdate(id, update, { new: true });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error updating conductor entry:', error);
        res.status(500).send('Error updating entry');
    }
});

const insulationSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    customerName: String,
    size: { type: String, required: true },
    drumNumber: { type: String, required: true },
    color: String,
    insulatedLength: { type: Number, required: true },
    conductorDrumNumber: { type: String, required: true },
    remarks: String,
    hasBeenUpdated: { type: Boolean, default: false }
});

app.delete('/insulations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Insulation.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.status(200).send('Entry deleted successfully');
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error deleting insulation entry:', error);
        res.status(500).send('Error deleting entry');
    }
});

app.patch('/insulations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        // Fetch the existing document to check its current state
        const insulation = await Insulation.findById(id);

        if (!insulation) {
            return res.status(404).send('Entry not found');
        }

        // If the existing remarks are "OK", prevent further updates
        if (insulation.remarks && insulation.remarks.toLowerCase() === 'ok') {
            return res.status(400).send('Cannot update entry marked as OK');
        }

        // Update the document
        Object.assign(insulation, update);

        // If remarks is set to "OK", prevent future updates
        if (update.remarks && update.remarks.toLowerCase() === 'ok') {
            insulation.hasBeenUpdated = true;
        }

        await insulation.save();

        res.status(200).send('Entry updated successfully');
    } catch (error) {
        console.error('Error updating insulation entry:', error);
        res.status(500).send('Error updating entry');
    }
});


const LUPSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    CustomerName: { type: String, required: false },
    size: { type: String, required: true },
    drumNumber: { type: String, required: true },
    length: { type: Number, required: true },
    insulationDrumNumber1: { type: String, required: true },
    insulationDrumNumber2: { type: String, required: false },
    insulationDrumNumber3: { type: String, required: false },
    insulationDrumNumber4: { type: String, required: false },
    insulationDrumNumber5: { type: String, required: false },
    remarks: { type: String, required: false },
    hasBeenUpdated: { type: Boolean, default: false }
});

app.delete('/LUPs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await LUP.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.status(200).send('Entry deleted successfully');
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error deleting L-UP entry:', error);
        res.status(500).send('Error deleting entry');
    }
});
app.patch('/LUPs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        // If remarks is set to "OK", prevent further updates
        if (update.remarks && update.remarks.toLowerCase() === 'ok') {
            update.hasBeenUpdated = true;
        }

        const result = await LUP.findByIdAndUpdate(id, update, { new: true });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error updating L-UP entry:', error);
        res.status(500).send('Error updating entry');
    }
});


const innerSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    customerName: { type: String, required: false },
    size: { type: String, required: true },
    drumNumber: { type: String, required: true },
    length: { type: Number, required: true },
    lupDrumNumber: { type: String, required: false },
    insulationDrumNumber: { type: String, required: false },
    remarks: { type: String, required: false },
    hasBeenUpdated: { type: Boolean, default: false }
});
// DELETE route
app.delete('/inners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete entry with ID: ${id}`);
        const result = await Inner.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.status(200).send('Entry deleted successfully');
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error deleting inner entry:', error);
        res.status(500).send('Error deleting entry');
    }
});

// PATCH route
app.patch('/inners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        console.log(`Attempting to update entry with ID: ${id} with data:`, update);

        // If remarks is set to "OK", prevent further updates
        if (update.remarks && update.remarks.toLowerCase() === 'ok') {
            update.hasBeenUpdated = true;
        }

        const result = await Inner.findByIdAndUpdate(id, update, { new: true });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error updating inner entry:', error);
        res.status(500).send('Error updating entry');
    }
});

const armourSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    customerName: { type: String, required: false },
    size: { type: String, required: true },
    drumNumber: { type: String, required: true },
    length: { type: Number, required: true },
    innerDrumNumber: { type: String, required: false },
    lupDrumNumber: { type: String, required: false },
    insulationDrumNumber: { type: String, required: false },
    remarks: String,
    hasBeenUpdated: { type: Boolean, default: false }
});
// DELETE route
app.delete('/armours/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete entry with ID: ${id}`);
        const result = await Armour.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.status(200).send('Entry deleted successfully');
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error deleting inner entry:', error);
        res.status(500).send('Error deleting entry');
    }
});

// PATCH route
app.patch('/armours/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        console.log(`Attempting to update entry with ID: ${id} with data:`, update);

        // If remarks is set to "OK", prevent further updates
        if (update.remarks && update.remarks.toLowerCase() === 'ok') {
            update.hasBeenUpdated = true;
        }

        const result = await Armour.findByIdAndUpdate(id, update, { new: true });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error updating inner entry:', error);
        res.status(500).send('Error updating entry');
    }
});

const outerSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    SO: { type: Number, required: true },
    customerName: { type: String, required: false },
    size: { type: String, required: true },
    drumNumber: { type: String, required: true },
    length: { type: Number, required: true },
    armourDrumNumber: { type: String, required: false },
    innerDrumNumber: { type: String, required: false },
    lupDrumNumber: { type: String, required: false },
    insulationDrumNumber: { type: String, required: false }
});

const Conductor = mongoose.model('Conductor', conductorSchema);
const Insulation = mongoose.model('Insulation', insulationSchema);
const LUP = mongoose.model('LUP', LUPSchema);
const Inner = mongoose.model('Inner', innerSchema);
const Armour = mongoose.model('Armour', armourSchema);
const Outer = mongoose.model('Outer', outerSchema);
// POST route to save conductor data

app.post('/conductor', async (req, res) => {
    try {
        // Log the received data
        console.log('Received data:', req.body);

        // Ensure all required fields are present and valid
        const { date, SO, size, drumNumber, balanceLength } = req.body;

        if (!date || !SO || !size || !drumNumber || !balanceLength) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create a new Conductor document
        const newConductor = new Conductor({
            date: new Date(date),
            SO: Number(SO),
            customerName: req.body.customerName || '',
            size,
            conductorType: req.body.conductorType || '',
            drumNumber,
            balanceLength: Number(balanceLength),
            cableType: req.body.cableType || '',
            cutLength: req.body.cutLength || '',
            remarks: req.body.remarks || ''
        });

        // Save the document
        const savedConductor = await newConductor.save();
        
        res.status(201).json(savedConductor);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting conductor data', error: error.message });
    }
});
// for handling excel file as upload in conductor
app.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const processedData = data.map(row => ({
            date: new Date(row.date), // Ensure this is a valid date
            SO: row.SO,
            customerName: row.customerName || '',
            size: row.size,
            conductorType: row.conductorType || '',
            drumNumber: row.drumNumber,
            balanceLength: row.balanceLength,
            cableType: row.cableType || '',
            cutLength: row.cutLength || '',
            remarks: row.remarks || ''
        }));

        // Insert conductor data into MongoDB
        const insertResult = await Conductor.insertMany(processedData, { ordered: false });

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.send(`Conductor data inserted successfully! ${insertResult.length} records inserted.`);
    } catch (err) {
        console.error(err);
        if (err.writeErrors) {
            const errorCount = err.writeErrors.length;
            const successCount = err.insertedDocs.length;
            res.status(207).send(`Partially successful. ${successCount} records inserted, ${errorCount} failed.`);
        } else {
            res.status(500).send('Error uploading file: ' + err.message);
        }
    }
});


// POST route to save insulation data
app.post('/insulation', async (req, res) => {
    try {
        const newInsulation = new Insulation(req.body);
        const savedInsulation = await newInsulation.save();

        const conductor = await Conductor.findOne({ drumNumber: req.body.conductorDrumNumber });
        if (conductor) {
            conductor.balanceLength -= req.body.insulatedLength;
            if (conductor.balanceLength <= 0) {
                await Conductor.deleteOne({ drumNumber: req.body.conductorDrumNumber });
            } else {
                await conductor.save();
            }
            res.json(savedInsulation);
        } else {
            res.status(200).json({
                insulation: savedInsulation,
                warning: 'Conductor drum not found. Insulation data saved, but conductor data not updated.'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting insulation data', error });
    }
});

app.post('/LUP', async (req, res) => {
    try {
        const newLUP = new LUP(req.body);
        const savedLUP = await newLUP.save();

        const updateInsulationDrum = async (drumNumber) => {
            if (!drumNumber) return;

            const result = await Insulation.findOneAndUpdate(
                { drumNumber: drumNumber },
                { $inc: { insulatedLength: -req.body.length } },
                { new: true }
            );

            if (result && result.insulatedLength <= 0) {
                await Insulation.deleteOne({ drumNumber: drumNumber });
            }
        };

        const insulationDrumNumbers = [
            req.body.insulationDrumNumber1,
            req.body.insulationDrumNumber2,
            req.body.insulationDrumNumber3,
            req.body.insulationDrumNumber4,
            req.body.insulationDrumNumber5
        ];

        await Promise.all(insulationDrumNumbers.map(updateInsulationDrum));

        res.json(savedLUP);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting LUP data', error: error.message });
    }
});
// POST route to save inner data
app.post('/inner', async (req, res) => {
    try {
        const newInner = new Inner(req.body);
        const savedInner = await newInner.save();

        if (req.body.lupDrumNumber) {
            const lup = await LUP.findOneAndUpdate(
                { drumNumber: req.body.lupDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (lup && lup.length <= 0) {
                await LUP.deleteOne({ drumNumber: req.body.lupDrumNumber });
            }
        }

        if (req.body.insulationDrumNumber) {
            const insulation = await Insulation.findOneAndUpdate(
                { drumNumber: req.body.insulationDrumNumber },
                { $inc: { insulatedLength: -req.body.length } },
                { new: true }
            );
            if (insulation && insulation.insulatedLength <= 0) {
                await Insulation.deleteOne({ drumNumber: req.body.insulationDrumNumber });
            }
        }

        res.json(savedInner);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting inner data', error });
    }
});

// POST route to save armour data
app.post('/armour', async (req, res) => {
    try {
        const newArmour = new Armour(req.body);
        const savedArmour = await newArmour.save();

        if (req.body.innerDrumNumber) {
            const inner = await Inner.findOneAndUpdate(
                { drumNumber: req.body.innerDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (inner && inner.length <= 0) {
                await Inner.deleteOne({ drumNumber: req.body.innerDrumNumber });
            }
        }

        if (req.body.lupDrumNumber) {
            const lup = await LUP.findOneAndUpdate(
                { drumNumber: req.body.lupDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (lup && lup.length <= 0) {
                await LUP.deleteOne({ drumNumber: req.body.lupDrumNumber });
            }
        }

        if (req.body.insulationDrumNumber) {
            const insulation = await Insulation.findOneAndUpdate(
                { drumNumber: req.body.insulationDrumNumber },
                { $inc: { insulatedLength: -req.body.length } },
                { new: true }
            );
            if (insulation && insulation.insulatedLength <= 0) {
                await Insulation.deleteOne({ drumNumber: req.body.insulationDrumNumber });
            }
        }

        res.json(savedArmour);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting armour data', error });
    }
});

// POST route to save outer data
// POST route to save outer data
app.post('/outer', async (req, res) => {
    try {
        const newOuter = new Outer(req.body);
        const savedOuter = await newOuter.save();

        if (req.body.armourDrumNumber) {
            const armour = await Armour.findOneAndUpdate(
                { drumNumber: req.body.armourDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (armour && armour.length <= 0) {
                await Armour.deleteOne({ drumNumber: req.body.armourDrumNumber });
            }
        }

        if (req.body.innerDrumNumber) {
            const inner = await Inner.findOneAndUpdate(
                { drumNumber: req.body.innerDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (inner && inner.length <= 0) {
                await Inner.deleteOne({ drumNumber: req.body.innerDrumNumber });
            }
        }

        if (req.body.lupDrumNumber) {
            const lup = await LUP.findOneAndUpdate(
                { drumNumber: req.body.lupDrumNumber },
                { $inc: { length: -req.body.length } },
                { new: true }
            );
            if (lup && lup.length <= 0) {
                await LUP.deleteOne({ drumNumber: req.body.lupDrumNumber });
            }
        }

        if (req.body.insulationDrumNumber) {
            const insulation = await Insulation.findOneAndUpdate(
                { drumNumber: req.body.insulationDrumNumber },
                { $inc: { insulatedLength: -req.body.length } },
                { new: true }
            );
            if (insulation && insulation.insulatedLength <= 0) {
                await Insulation.deleteOne({ drumNumber: req.body.insulationDrumNumber });
            }
        }

        res.json(savedOuter);  // <-- Changed this to savedOuter
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting outer data', error });  // <-- Changed the error message
    }
});



// GET routes to fetch data
app.get('/conductors', async (req, res) => {
    try {
        const conductors = await Conductor.find();
        res.json(conductors);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching conductor data', error });
    }
});

app.get('/insulations', async (req, res) => {
    try {
        const insulations = await Insulation.find();
        res.json(insulations);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching insulation data', error });
    }
});

app.get('/LUPs', async (req, res) => {
    try {
        const LUPs = await LUP.find();
        res.json(LUPs);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching LUP data', error });
    }
});

app.get('/inners', async (req, res) => {
    try {
        const inners = await Inner.find();
        res.json(inners);
    } catch (error) {
        console.error('Error fetching inner data:', error);
        res.status(500).json({ message: 'Error fetching inner data', error });
    }
});

app.get('/armours', async (req, res) => {
    try {
        const armours = await Armour.find();
        res.json(armours);
    } catch (error) {
        console.error('Error fetching armour data:', error);
        res.status(500).json({ message: 'Error fetching armour data', error });
    }
});

app.get('/outers', async (req, res) => {
    try {
        const outers = await Outer.find();
        res.json(outers);
    } catch (error) {
        console.error('Error fetching outer data:', error);
        res.status(500).json({ message: 'Error fetching outer data', error });
    }
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});