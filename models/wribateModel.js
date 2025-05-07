import mongoose from "mongoose";

const proposeWribateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    votes: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
    },
    tag: {
        type: String
    },
    country: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    context:{
        type:String,
        require:false
    }
})

const proposeVoteSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    propose_id:{
        type:String,
        required:true
    }
})

//wribate schema

// const roundSchema = new Schema({
//     roundName: {
//       type: String,
//       required: true,
//     },
//     roundNumber: {
//       type: Number,
//       required: true,
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//       validate: {
//         validator: function(value) {
//           return value > this.startDate; // End date must be after start date
//         },
//         message: 'End date must be after start date.'
//       }
//     }
//   });


// const WribateSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true,
//     },
//     tag: {
//         type: String
//     },
//     country: {
//         type: String,
//         required: true,
//     },
//     forEmail: {
//         type: String,
//         required: true,
//     },
//     againstEmail:{
//         type: String,
//         required: true
//     },
//     user_id: {
//         type: String,
//         required: true,
//     },
//     duration:{
//         type: String,
//         required: true,
//     },
//     startDate:{
//         type: Date,
//         required:true
//     },
//     rounds: {
//         type: [roundSchema],
//         required:true
//     }
// }, { timestamps: true })

const proposeVoteModel = mongoose.model('proposeVote', proposeVoteSchema);

const proposeModel = mongoose.model('proposeWribate', proposeWribateSchema);

export {proposeModel, proposeVoteModel};