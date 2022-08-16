<h1 align="center">Food Planner</h1>

<div align="center">A cross-platform Angular web application for planning daily meals.</div>

## About

### Built with

* [![Angular][Angular]][Angular-url]
* [![Angular Material][Angular-material]][Angular-material-url]
* [![Firebase][Firebase]][Firebase-url]
* [![RxJS][RxJS]][RxJS-url]

### Features

* Build a collection of foods, adding an image, description, labels and ingredients to each food.
* Create daily food plans using food collection.
* Generate a weekly shopping list using the ingredients of each food within a week's food plan.
* Create groups to collaborate and share foods & food plans with friends.
	* Add members with edit or view permissions.
* Email / password authentication.
* Search foods by label.
* Supports mobile and desktop devices with reactive layouts.

## Table of Contents

* [About](#about)
	* [Built with](#built-with)
	* [Features](#features)
* [Table of Contents](#table-of-contents)
* [Usage](#usage)
	* [Adding a food](#adding-a-food)
		* [Food ingredients](#food-ingredients)
	* [Creating food plan](#creating-food-plan)
	* [Choosing ingredients within a food plan](#choosing-ingredients-within-a-food-plan)
	* [Weekly Shopping List](#weekly-shopping-list)
	* [Groups](#groups)
* [Installation](#installation)
	* [Prerequisites](#prerequisites)
* [Roadmap](#roadmap)

## Usage

<img align="right" src="https://user-images.githubusercontent.com/12361038/185805472-02435325-e3ef-4ffd-a326-8e4b12210e56.png" alt="Food Details Page">

### Adding a food

Foods can be added from the foods page. Foods can be assigned labels which can then be used to search for foods with
specific labels. Previously used labels are available for autocomplete when adding/searching labels.

<br/>
<br/>

#### Food ingredients

Ingredients can be chosen on each food's details page. There are two types of ingredients:

* Core Ingredients: These are necessary for the for each food's creation. When adding foods to the planner, core
  ingredients will be selected automatically.
* Optional Ingredients: These are ingredients that might be used for the food, but not everytime. When adding foods to
  the planner, optional ingredients will be available for manual selection but are not selected automatically.

<br/>
<br/>
<br/>

### Creating food plan

* Navigate to the planner page by using the side menu.
* The planner shows a list of 7 days for the current week.
	* Using the left and right arrows, the next or previous week can be displayed.
* Pressing on a green plus icon by a date will allow foods to be added for that date.
	* A food can be chosen at random, or by using the search box.

<p align="center">
	<img src="https://user-images.githubusercontent.com/12361038/185811984-838e5366-cc5b-4f63-9350-964ecb9e2412.gif" alt="Adding Food to FoodPlan">
</p>

### Choosing ingredients within a food plan

Each food added to a food plan can be customized with ingredients. Ingredients for a food plan can be selected on the
food plan details page, accessible by pressing the date of the food plan. Note that a food's core ingredients are
automatically selected upon adding to a food plan, requiring no further action from the user. Selected ingredients will
be used to assemble a weekly shopping list.

<table align="center">
	<thead>
		<td>
			<img src="https://user-images.githubusercontent.com/12361038/186012163-7a8b569a-9519-4153-a8a6-5302fd429e39.png" alt="Showing only a food's core and optional ingredients">
		</td>
		<td>
			<img src="https://user-images.githubusercontent.com/12361038/186012108-2b36723c-82a3-49c3-a0a7-6b5add575f21.png" alt="Food Plan Details">
		</td>
	</thead>
	<tr>
		<td>Ingredients of food</td>
		<td>Core ingredients are auto-selected</td>
	</tr>
</table>

### Weekly Shopping List

A weekly shopping list can be accessed via the shopping list button on the planner page. This is an aggregation of
ingredients selected for each food within the week.

<p align="center">
	<img src="https://user-images.githubusercontent.com/12361038/186008818-72b094f4-68a2-4c82-9564-9ed26cf132a8.gif" alt="Shopping List Demo">
</p>

### Groups

Groups allow foods and food plans to be separated between different groups of people. Groups are managed from the
profile page, allowing for the following actions:

* Creating, renaming and deleting (leaving if not owner) new groups.
* Adding new members to groups using their user ID. Members can be assigned edit or view-only permissions.
* Changing your selected group. This changes which group's food / food plans are visible. Only one group can be selected
  at a time.

<p align="center">
	<img src="https://user-images.githubusercontent.com/12361038/185812869-915d1056-cb22-40f1-8216-896c45fde580.png" height="500px" alt="Profile Page">
</p>

## Installation

Steps to run a local instance of FoodPlanner using Firebase Local Emulator Suite

### Prerequisites

* node.js
* npm

1. Install npm packages
   ```shell
   npm install
   ```

2. Install Firebase Emulator Suite
   ```shell
   firebase init emulators
   ```

3. Run dev server
   ```shell
   ng serve
   ```

<details>
	<summary>Steps to run live instance of FoodPlanner on Firebase</summary>

1. Create a firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Install npm packages
   ```shell
   npm install
   ```
3. Add Firebase configuration details to [environment.ts](src/environments/environment.ts)
   and [environment.prod.ts](src/environments/environment.prod.ts)
   ```ts
   export const environment = {
   	production: false,
   	firebase: {
   		apiKey: '<your-key>',
   		authDomain: '<your-project-authdomain>',
   		databaseURL: '<your-database-URL>',
   		projectId: '<your-project-id>',
   		storageBucket: '<your-storage-bucket>',
   		messagingSenderId: '<your-messaging-sender-id>'
   	}
   };
   ```

</details>

## Roadmap

* Add anonymous login, allowing for use without creating an account.
* Add user customisations:
	* Changing start of week.
	* Adding profile photo.
	* Themes based on selected group.

<!-- Markdown Links -->

[Angular]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white

[Angular-url]: https://angular.io/

[Angular-material]: https://img.shields.io/badge/-Angular%20Material-3f51b5?style=for-the-badge&logo=angular

[Angular-material-url]: https://angular.io/

[Firebase]: https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase

[Firebase-url]: https://firebaseopensource.com/projects/angular/angularfire2/

[RxJS]: https://img.shields.io/badge/rxjs-%23B7178C.svg?style=for-the-badge&logo=reactivex&logoColor=white

[RxJS-url]: https://rxjs.dev/
