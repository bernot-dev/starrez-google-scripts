# Post Data Examples for Hangouts Chat Webhooks

Here are a few examples of ways that you can use Data Subscriptions to post directly into a Google Hangouts Chat room. This maps a [StarRez "Post to Web Service" Data Subscription](https://support.starrez.com/hc/en-us/articles/115000379306-Data-Subscription-Wizard-Step-3-Select-a-Task-Post-to-Web-Service-) to a [Google Hangouts Chat Incoming Webhook](https://developers.google.com/hangouts/chat/how-tos/webhooks).


## New Booking
```json
{
	"cards": [
		{
			"header": {
				"title": "{NewData_EntryID.NameFirst} {NewData_EntryID.NameLast}",
				"subtitle": "{NewData_EntryID.ID1}{#IF:NewData_EntryID.EntryDetail.PhotoPath}",
				"imageUrl": "{NewData_EntryID.EntryDetail.PhotoPath}",
				"imageStyle": "AVATAR{/IF}"
			},
			"sections": [
				{
					"widgets": [
						{
							"keyValue": {
								"topLabel": "Room Space",
								"content": "{NewData_RoomSpaceID.WebDescription|NewData_RoomSpaceID.Description}",
								"icon": "HOTEL"
							}
						},
						{
							"keyValue": {
								"topLabel": "Room Profile",
								"content": "{SELECT ProfileItem FROM RoomConfiguration JOIN RoomConfigurationProfile WHERE RoomBaseID={NewData_RoomSpaceID.RoomBaseID} AND DateStart<={NewData_CheckInDate} AND DateEnd>{NewData_CheckInDate}}",
								"icon": "HOTEL_ROOM_TYPE"
							}
						},
						{
							"keyValue": {
								"topLabel": "Term Session",
								"content": "{NewData_TermSessionID.WebDescription|NewData_TermSessionID.Description}",
								"icon": "CLOCK"
							}
						},
						{
							"keyValue": {
								"topLabel": "Created By",
								"content": "{NewData_SecurityUserID.FullName|NewData_SecurityUserID.UserName}",
								"icon": "PERSON"
							}
						}
					]
				},
				{
					"widgets": {
						"buttons": [
							{
								"textButton": {
									"text": "VIEW BOOKING",
									"onClick": {
										"openLink": {
											"url": "https://wfu.starrezhousing.com/StarRezWeb/main/directory#!entry:{NewData_EntryID}!booking:{NewData_BookingID}"
										}
									}
								}
							},
							{
								"textButton": {
									"text": "VIEW ENTRY",
									"onClick": {
										"openLink": {
											"url": "https://wfu.starrezhousing.com/StarRezWeb/main/directory#!entry:{NewData_EntryID}"
										}
									}
								}
							}
						]
					}
				}
			]
		}
	]
}
```
