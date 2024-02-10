# ScreenLife Tagging Platform

### Setup Summary
In order to function properly, the platform expects for the projects, participants and images associated to be in a particular format, specifically:

```
parent_folder/
	project_1/
		participant_1/
			image1.png
			image2.png
		participant_2/
			image1.png
			image3.png
	project_2/
		participant_3/
			image4.png
			image5.png
		participant_4/
			image6.png
			image7.png
```

Note that the above is just an illustration of the expected file structure. The following must also be true:
1. A project folder has to contain a file called `project.json`, with a string `projectId` defined. 
2. A participant folder has to contain a file called `participant.json`, with a string `participantId` defined. 
3. Every `projectId`, `participantId`, and image filename **must be unique globally**.

Examples:

`project.json`
```json
{
	"projectId": "project-1"
}
```

`participant.json`
```json
{
	"participantId": "participant-1"
}
```

### Projects Sync
In order to populate the Projects and Participants on the platform, a sync must be performed with the filesystem of the host server (where the project / participant folders are presumably stored). 

The process is as follows:
1. The server looks at the `projectFolderLocations` folders for folders with a valid `project.json`, which is supposed to provide a unique `projectId` string. These folders are considered project foldesr.
2. For each project folder, the server looks for folders with a valid `participant.json`, which is supposed to provide a unique `participantId` string. These folders are considered participant folders of that project folder.
3. If the `projectId`s and `participantId`s are not on the database, they are added to it, along with their paths on the filesystem.
4. If they are already in the database, their paths are updated. This is to handle the case where the project / participant folder locations change on the filesystem. 
5. For each participant folder, each image's `path`, `name`, and `timestamp` are saved into the database. 


### Sessions Sync
Similar to Projects and Participants, Images and Sessions also need to be sync-ed to the filesystem on the host server. This process is done on a per-participant level.

The process is as follows:
1. The sessions sync is triggered on the server, typically during the projects sync process above. 
2. For a particular participant folder, every image is iterated over, and the `name`, `path`, and `timestamp` are recorded into the database. Each image is also given a globally unique surrogate key, `id`, used when interfacing with the frontend. (This prevents the actual filename / paths being exposed on the server, while still allowing us to link each tag with the name of the file itself).