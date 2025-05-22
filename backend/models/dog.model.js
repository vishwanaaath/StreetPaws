import mongoose from "mongoose";

const dogSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    type: {
      type: String,
      required: [true, "Dog type is required"],
      enum: [
        "Brown",
        "Black",
        "White",
        "Brown and White",
        "Black and White",
        "Unique",
      ],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: (props) => `Invalid coordinates: ${props.value}`,
        },
      },
    },
    placeName: {
      type: String,
      trim: true,
    },
    age: {
      type: String,
      required: [true, "Age is required"],
      enum: [
        "0-6 months",
        "6-12 months",
        "1-2 years",
        "3-5 years",
        "More than 5 years",
      ],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Unknown"],
    },
    listerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lister ID is required"],
    },
    adopted: {
      type: Boolean,
      default: false,
    },
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    collection: "dogs",
  }
);

dogSchema.index({ location: "2dsphere" });

dogSchema.post("save", function (error, doc, next) {
  if (error.name === "ValidationError") {
    next(
      new Error(
        Object.values(error.errors)
          .map((err) => err.message)
          .join(", ")
      )
    );
  } else {
    next(error);
  }
});

const Dog = mongoose.model("Dog", dogSchema);
export default Dog;
