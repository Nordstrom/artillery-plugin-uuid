# artillery-plugin-uuid

A plugin for artillery.io that generates UUID (version 4) variables for use in script

To use:

1. `npm install -g artillery`
2. `npm install -g artillery-plugin-uuid` (omit `-g` if it will be loaded from the local `node_modules` directory)
3. add `uuid` plugin to your `hello.yml` Artillery script:


```yaml
config:
  plugins:
    uuid:
      vars: [ 'id1' , 'id2' ] # array of variable names
  target: "https://aws.amazon.com"
  phases:
    -
      duration: 5 # time in seconds script will run
      arrivalRate: 1 # requests/second
scenarios:
  - flow:
    - options: # see footnote (a)
       url: '/'
       beforeRequest: addUUID  # request-level hook. each call will reset variable values to a new UUID
    - post:
        url: '/{{ id1 }}' # {{ id1 }} replaced by UUID assigned to id1
    - get:
        url: '/{{ id1 }}' # {{ id1 }} replaced by UUID assigned to id1
    - post:
        url: '/{{ id2 }}' # {{ id2 }} replaced by UUID assigned to id2
    - get:
        url: '/{{ id2 }}' # {{ id2 }} replaced by UUID assigned to id2
```
4. create scenario-level (and sub-scenario-level) hooks wherever you would like UUID values to be regenerated (see footnote `(b)` for verbose explanation)
5. `artillery run hello.yml`


###### footnotes
`(a)` VERY IMPORTANT! Variables are not avaiable in the flow entry that generates them. If you implement the hook within
the post or get, artillery will not create the variable in time for use. Using `options`, we enable calling `beforeRequest` prior to entering the
request bodies, and the variables are ready for use within requests.

`(b)` The level at which the hook is created determines the frequency at which the plugin is called.
The example script generates a request-level hook. This creates one set of UUID's to be used for all
requests within the flow. Generating a flow-level hook, on the other hand, will generate new UUID's with each
new request.
