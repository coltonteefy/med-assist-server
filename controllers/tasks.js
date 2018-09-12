var Task = require('../models/tasks');

exports.getAllTasks = function (req, res) {
    Task.find({}, function (err, task) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(task));
    })
};

exports.getTasksById = function (req, res) {
    Task.find({userId: req.params.userId}, function (err, task) {
        if (err) {
            res.send(err);
        } else
            res.send(JSON.stringify(task));
    })
};

exports.getTask = function (req, res) {
    Task.find({_id: req.params.taskID}, function (err, task) {
        if (err) {
            res.send(err)
        } else
            res.send(task);
    });
};

exports.addTask = function (req, res) {
    var task = new Task();
    task.taskTitle = req.body.taskTitle;
    task.taskDescription = req.body.desc;
    task.taskStartDate = req.body.startDate;
    task.taskEndDate = req.body.endDate;
    task.userId = req.body.userId;

    task.save(function (err) {
        if (err) {
            res.send(err);
        } else
            res.send({message: "Task was saved.", data: task})
    });
};

exports.updateTask = function (req, res) {
    console.log(req.params.userId);
    Task.updateOne({userId: req.params.userId}, {
        taskTitle: req.body.taskTitle,
        taskDescription: req.body.desc,
        taskStartDate: req.body.startDate,
        taskEndDate: req.body.endDate
    }, function (err, num, raw) {
        if (err) {
            res.send(err);
        }
        res.json(num);
    });
};

exports.deleteTask = function (req, res) {
    Task.remove({_id: req.params.taskID}, function (err) {
        if (err) {
            res.send(err);
        }
        res.json({message: "The task was deleted"});
    });
};