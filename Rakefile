desc "Build drawing_fabric (excludes jQuery and Fabric dependency)"
task :build do
  require "sprockets"
  environment = Sprockets::Environment.new
  environment.append_path 'src'
  environment.append_path 'vendor'
  environment["stubs"].write_to("build/drawing_fabric.js")
end
