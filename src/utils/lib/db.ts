import mongoose from "mongoose";

export function find_DB(tablename: string, query: any, cb: any) {
	mongoose.connection.db.collection(tablename, function (err, collection) {
		collection.find(query).toArray(cb);
	});
}

export function find_DB_Return(tablename: string, query: any): Promise<any> {
	return new Promise((resolve, reject) => {
		mongoose.connection.db.collection(tablename, function (err, collection) {
			collection.find(query).toArray(function (err, result) {
				if (err) reject(err);
				resolve(result);
			});
		});
	});
}

export function insert_DB_One(tableName: string, data: any) {
	mongoose.connection.db.collection(tableName).insertOne(data);
}

export function edit_DB_One(tableName: string, query: any, data: any) {
	mongoose.connection.db.collection(tableName).updateOne(query, { $set: data });
}

export function delete_DB_One(tableName: string, query: any) {
	mongoose.connection.db.collection(tableName).deleteOne(query);
}