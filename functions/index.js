// functions/index.js
const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

setGlobalOptions({region: "australia-southeast1"});
admin.initializeApp();

exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snap = await admin.firestore().collection("books").get();
      res.status(200).json({count: snap.size});
    } catch (e) {
      console.error("countBooks error:", e);
      res.status(500).send("Error counting books");
    }
  });
});

// NEW: Automatically capitalize book name when created
exports.capitalizeBookName = onDocumentCreated(
    "books/{bookId}",
    async (event) => {
      try {
        const data = event.data.data();

        // Check if name exists and isn't already capitalized
        if (data.name && data.name !== data.name.toUpperCase()) {
          await event.data.ref.update({
            name: data.name.toUpperCase(),
          });
          console.log(`Capitalized book: ${data.name} ->
             ${data.name.toUpperCase()}`);
        }
      } catch (e) {
        console.error("Error capitalizing book name:", e);
      }
    },
);

exports.getAllBooks = require("firebase-functions")
    .region("australia-southeast1")
    .https.onRequest(async (req, res) => {
      const admin = require("firebase-admin");
      const cors = require("cors")({origin: true});
      cors(req, res, async () => {
        try {
          const snapshot = await admin.firestore().collection("books").get();
          const books = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.status(200).json(books);
        } catch (error) {
          console.error("Error fetching books:", error);
          res.status(500).send("Error fetching books");
        }
      });
    });
