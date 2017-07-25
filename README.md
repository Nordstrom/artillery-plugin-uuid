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
  phases: #
scenarios:
  - flow:
    - options:
       url: '/'
       beforeRequest: addUUID  # request-level hook. each call will reset variable values to a new UUID
    - get:
        url: '/{{ id1 }}'
        #
    - post:
        url: '/{{ id2 }}'        
        #
```
4. create scenario-level (and sub-scenario-level) hooks wherever you please (see footnote `(a)` for verbose explanation)
5. `artillery run hello.yml`

This will add two UUID variables (`id1` and `id2`) to the scenario. 

###### footnotes
`(a)` The level at which the hook is created determines the frequency at which the plugin is called.
The example script generates a request-level hook. This creates one set of UUID's to be used for all
requests within the flow. Generating a flow-level hook, on the other hand, will generate new UUID's with each
new request.
