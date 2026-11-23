# Sprinkles

Sprinkles is a CLI tool for generating Spring Boot projects directly from the terminal.

I started this project to make Spring Boot project setup easier and to learn more about CLI development with TypeScript. Sprinkles uses Spring Initializr to create applications based on the selected configuration and provides commands to generate Java code inside existing projects.

## Features

- Interactive project configuration through the terminal.
- Support for Maven and Gradle.
- Selection of Java and Spring Boot versions.
- Dependency selection.
- Custom project metadata and package names.
- Support for JAR and WAR packaging.
- Save and reuse project configurations.
- Generate JPA entities and CRUD resources in existing Spring Boot projects.
- Automatic detection of Spring Boot projects.
- Validation of project names and metadata.
- Protection against overwriting existing files.
- Rollback when resource generation fails.

## Installation

Sprinkles can be executed using npx or installed globally with npm.

### Using npx

Run Sprinkles without installing it globally:

```bash
npx sprinkles-cli my-api
```

### Global Installation

Install Sprinkles globally:

```bash
npm install -g sprinkles-cli
```

Once installed, create a project using:

```bash
sprinkles my-api
```

## Creating a Spring Boot Project

Run Sprinkles followed by the project name:

```bash
sprinkles my-api
```

The CLI will guide you through the configuration, including the build tool, Java version, Spring Boot version, dependencies and project metadata.

Sprinkles downloads the project from Spring Initializr and extracts it into a new directory.

The generated application keeps the standard Spring Initializr structure without adding example controllers or unnecessary packages.

### Reusing Project Configurations

You can save your project configuration for future use:

```bash
sprinkles my-api --save-config
```

This saves the selected settings to a `sprinkles.json` file.

To create another project using an existing configuration:

```bash
sprinkles another-api --config sprinkles.json
```

By default, the metadata stored in the configuration is preserved.

To use the new project name as the artifact ID and regenerate the package name:

```bash
sprinkles another-api --config sprinkles.json --use-project-name
```

## Generating CRUD Resources

Sprinkles can generate a complete CRUD structure inside an existing Spring Boot project.

Navigate to your project:

```bash
cd my-api
```

Run:

```bash
sprinkles generate entity Book
```

The CLI detects the project's Java package and asks you to define the entity fields, their types and whether they are required.

For example:

| Field | Type | Required |
|---|---|---|
| title | String | Yes |
| author | String | Yes |
| pages | Integer | No |
| price | BigDecimal | No |
| publishedAt | LocalDate | No |

Sprinkles generates the following structure:

```text
src/main/java/com/example/myapi/
├── MyApiApplication.java
├── entity/
│   └── Book.java
├── repository/
│   └── BookRepository.java
├── dto/
│   ├── BookRequest.java
│   └── BookResponse.java
├── service/
│   └── BookService.java
└── controller/
    └── BookController.java
```

Each generated file has a specific responsibility:

- **Entity:** Defines the JPA entity and its fields.
- **Repository:** Handles database operations using Spring Data JPA.
- **Request DTO:** Defines the data received by the API.
- **Response DTO:** Defines the data returned by the API.
- **Service:** Implements the CRUD operations.
- **Controller:** Exposes the REST endpoints.

### Generated Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/books` | Create a book |
| GET | `/api/books` | List all books |
| GET | `/api/books/{id}` | Find a book by ID |
| PUT | `/api/books/{id}` | Update a book |
| DELETE | `/api/books/{id}` | Delete a book |

Supported field types currently include `String`, `Integer`, `Long`, `Boolean`, `BigDecimal` and `LocalDate`.

The generated entity includes JPA annotations, an automatically generated `Long` primary key, a default constructor and column constraints for required fields.

Existing files are not overwritten. If generation fails, Sprinkles attempts to remove the files created during that operation.

CRUD generation requires Spring Web, Spring Data JPA and the appropriate database configuration.

## Running the Generated Project

After creating a project, navigate to its directory:

```bash
cd my-api
```

For Gradle projects:

```bash
./gradlew bootRun
```

For Maven projects:

```bash
./mvnw spring-boot:run
```

A compatible Java JDK is required.

Applications using Spring Data JPA may also require database configuration before they can start successfully.

## Development

To run Sprinkles locally:

```bash
git clone https://github.com/messeyes/Sprinkles.git
cd Sprinkles
npm install
npm run build
```

Link the CLI locally:

```bash
npm link
```

You can now run:

```bash
sprinkles my-api
```

To run the automated tests:

```bash
npm test
```

## Contributing

Contributions, suggestions and bug reports are welcome.

If you find a problem or have an idea for improvement, feel free to open an issue or submit a pull request.